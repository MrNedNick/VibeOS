import { ref, computed, watch, type ComputedRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHabitsStore } from '@/modules/habits/stores/habits.store'
import { useConfirm } from './useConfirm'
import { useAiInsight } from './useAiInsight'
import type { SelectOption } from '@/ui'

interface PlanWithLink { id: string; linkedHabitId?: string; resources?: unknown[] }
interface ResourceStore<TType extends string> {
  getPlanResources(planId: string): { id: string; url: string; title: string; type: TType; addedAt: string; done?: boolean }[]
  addResource(planId: string, data: { url: string; title: string; type: TType }): void
  deleteResource(planId: string, resourceId: string): void
  toggleResourceDone(planId: string, resourceId: string): void
}

/**
 * Shared skeleton behind Training/Learning `PlanDetailView.vue` (S15 T5):
 * route/plan resolution, delete confirmation, linked-habit editing, and the
 * resource list are identical between the two — only the stats row, "today"
 * card, and history-item rendering (workout volume vs. study minutes) differ,
 * and those stay in each view's own template.
 */
export function usePlanDetailPage<TPlan extends PlanWithLink, TType extends string>(opts: {
  listRoute: string
  getPlanById: (id: string) => TPlan | undefined
  updatePlanLink: (planId: string, habitId: string | undefined) => void
  deletePlan: (id: string) => void
  resourceStore: ResourceStore<TType>
  defaultResourceType: TType
  deleteConfirmBody: string
}) {
  const route = useRoute()
  const router = useRouter()

  const planId = computed(() => route.params.id as string)
  const plan = computed(() => opts.getPlanById(planId.value)) as ComputedRef<TPlan | undefined>

  if (!plan.value) router.replace(opts.listRoute)

  // ── AI post-log analysis ─────────────────────────────────────────────
  const { result: aiAnalysis, loading: aiAnalyzing, run: runAiAnalysis, dismiss: dismissAiAnalysis } = useAiInsight()

  // ── Confirm delete ───────────────────────────────────────────────────
  const { confirm } = useConfirm()

  async function askDelete() {
    const ok = await confirm({
      title:        'Delete this plan?',
      body:         opts.deleteConfirmBody,
      danger:       true,
      confirmLabel: 'Delete plan',
    })
    if (ok) {
      opts.deletePlan(planId.value)
      router.replace(opts.listRoute)
    }
  }

  function formatDate(iso: string): string {
    return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', {
      weekday: 'short', day: 'numeric', month: 'short',
    })
  }

  // ── Linked habit ─────────────────────────────────────────────────────
  const habitsStore = useHabitsStore()
  const linkedHabitId = ref(plan.value?.linkedHabitId ?? '')

  watch(() => plan.value?.linkedHabitId, (v) => { linkedHabitId.value = v ?? '' })

  function saveHabitLink() {
    opts.updatePlanLink(planId.value, linkedHabitId.value || undefined)
  }

  const habitOptions = computed<SelectOption[]>(() => [
    { value: '', label: '— none —' },
    ...habitsStore.habits.map(h => ({ value: h.id, label: h.name })),
  ])

  // ── Resources ────────────────────────────────────────────────────────
  const resources = computed(() => opts.resourceStore.getPlanResources(planId.value))

  const showAddResource = ref(false)
  const newResUrl   = ref('')
  const newResTitle = ref('')
  const newResType  = ref<TType>(opts.defaultResourceType)

  function submitResource() {
    if (!newResUrl.value.trim()) return
    opts.resourceStore.addResource(planId.value, {
      url:   newResUrl.value.trim(),
      title: newResTitle.value.trim() || newResUrl.value.trim(),
      type:  newResType.value,
    })
    newResUrl.value = ''; newResTitle.value = ''; newResType.value = opts.defaultResourceType
    showAddResource.value = false
  }

  function safeDomain(url: string): string {
    try { return new URL(url).hostname.replace('www.', '') }
    catch { return url }
  }

  return {
    route, router, planId, plan,
    aiAnalysis, aiAnalyzing, runAiAnalysis, dismissAiAnalysis,
    askDelete, formatDate,
    linkedHabitId, saveHabitLink, habitOptions,
    resources, showAddResource, newResUrl, newResTitle, newResType, submitResource,
    safeDomain,
  }
}
