import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { DOC_REGISTRY, findDocPage } from '../data/docs-registry'

// Eagerly load all markdown files at build time
export const DOC_FILES = import.meta.glob('/docs/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

export function useDocs() {
  const route = useRoute()

  const currentSlug = computed<string>(() => {
    const param = route.params.slug
    if (!param) return ''
    return Array.isArray(param) ? param.join('/') : param
  })

  const currentPage = computed(() =>
    currentSlug.value ? findDocPage(currentSlug.value) : null
  )

  const currentContent = computed<string | null>(() => {
    if (!currentPage.value) return null
    return DOC_FILES[currentPage.value.filePath] ?? null
  })

  function getContent(filePath: string): string | null {
    return DOC_FILES[filePath] ?? null
  }

  return {
    DOC_REGISTRY,
    DOC_FILES,
    currentSlug,
    currentPage,
    currentContent,
    getContent,
  }
}
