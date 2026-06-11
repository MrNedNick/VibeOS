/**
 * StudioModelPicker — provider-specific model chips + API key row.
 * Mocks useStudioStore; imports real model lists from types to assert labels.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import StudioModelPicker from '@/modules/ai-playground/components/StudioModelPicker.vue'
import {
  FREE_MODELS,
  STUDIO_MODELS,
  GROQ_MODELS,
  GEMINI_MODELS,
} from '@/modules/ai-playground/types'
import type { StudioProvider, StudioModel, FreeModel, GroqModel, GeminiModel } from '@/modules/ai-playground/types'

const mockStore = {
  provider:          'free' as StudioProvider,
  model:             'claude-sonnet-4-6' as StudioModel,
  freeModel:         'openai-fast' as FreeModel,
  groqModel:         'llama-3.1-8b-instant' as GroqModel,
  geminiModel:       'gemini-2.0-flash' as GeminiModel,
  openrouterModel:   '',
  apiKey:            '',
  groqApiKey:        '',
  geminiApiKey:      '',
  openrouterApiKey:  '',
  system:            '',
  includeContext:    false,
}

vi.mock('@/modules/ai-playground/stores/studio.store', () => ({
  useStudioStore: () => mockStore,
}))

beforeEach(() => {
  setActivePinia(createPinia())
  mockStore.provider = 'free'
  mockStore.apiKey = ''
  mockStore.groqApiKey = ''
  mockStore.geminiApiKey = ''
  mockStore.openrouterApiKey = ''
})

describe('StudioModelPicker — free provider', () => {
  it('renders free model chips', () => {
    const wrapper = mount(StudioModelPicker)
    const chips = wrapper.findAll('.sp-chip')
    expect(chips).toHaveLength(FREE_MODELS.length)
    expect(chips[0].text()).toBe(FREE_MODELS[0].label)
  })

  it('does not show the API key row for free provider', () => {
    expect(mount(StudioModelPicker).find('.sp-key-row').exists()).toBe(false)
  })
})

describe('StudioModelPicker — anthropic provider', () => {
  it('renders all STUDIO_MODELS chips', () => {
    mockStore.provider = 'anthropic'
    const wrapper = mount(StudioModelPicker)
    const chips = wrapper.findAll('.sp-chip')
    expect(chips).toHaveLength(STUDIO_MODELS.length)
    expect(chips.map(c => c.text())).toEqual(STUDIO_MODELS.map(m => m.label))
  })

  it('shows the API key row for anthropic provider', () => {
    mockStore.provider = 'anthropic'
    expect(mount(StudioModelPicker).find('.sp-key-row').exists()).toBe(true)
  })
})

describe('StudioModelPicker — groq provider', () => {
  it('renders all GROQ_MODELS chips', () => {
    mockStore.provider = 'groq'
    const wrapper = mount(StudioModelPicker)
    const chips = wrapper.findAll('.sp-chip')
    expect(chips).toHaveLength(GROQ_MODELS.length)
    expect(chips.map(c => c.text())).toEqual(GROQ_MODELS.map(m => m.label))
  })

  it('shows the API key row for groq provider', () => {
    mockStore.provider = 'groq'
    expect(mount(StudioModelPicker).find('.sp-key-row').exists()).toBe(true)
  })
})

describe('StudioModelPicker — gemini provider', () => {
  it('renders all GEMINI_MODELS chips', () => {
    mockStore.provider = 'gemini'
    const wrapper = mount(StudioModelPicker)
    const chips = wrapper.findAll('.sp-chip')
    expect(chips).toHaveLength(GEMINI_MODELS.length)
    expect(chips.map(c => c.text())).toEqual(GEMINI_MODELS.map(m => m.label))
  })
})

describe('StudioModelPicker — openrouter provider', () => {
  it('renders a text input instead of chips for openrouter', () => {
    mockStore.provider = 'openrouter'
    const wrapper = mount(StudioModelPicker)
    expect(wrapper.find('.sp-or-model-input').exists()).toBe(true)
    expect(wrapper.findAll('.sp-chip')).toHaveLength(0)
  })

  it('shows the API key row for openrouter provider', () => {
    mockStore.provider = 'openrouter'
    expect(mount(StudioModelPicker).find('.sp-key-row').exists()).toBe(true)
  })
})
