import { computed, watch, type ComputedRef, type Ref } from 'vue'
import { useSoftDeletable } from './useSoftDeletable'
import { storagGet } from '../utils/storage'
import { useEventBus } from '../events'
import { useBackendSync } from './useBackendSync'
import { useSyncBus } from './useSyncBus'

interface PlanLike { id: string; active: boolean; createdAt: string; updatedAt?: number; linkedHabitId?: string; resources?: unknown[] }
interface LogLike { id: string; planId?: string; deletedAt?: number }
type Resource<TType extends string> = { id: string; url: string; title: string; type: TType; addedAt: string; done?: boolean }

interface PlanModuleConfig {
  plansKey: string
  logsKey: string
  planCreatedEvent: string
}

/**
 * Shared skeleton behind the Training/Learning stores (S15 T5): sync wiring,
 * plan CRUD, resources, and CSV export are structurally identical between the
 * two — only the domain fields (workout volume vs. study minutes) differ, and
 * those stay in each store's own extra methods.
 */
export function usePlanModule<TPlan extends PlanLike, TLog extends LogLike>(config: PlanModuleConfig) {
  const { all: allPlans, items: plans, softDelete: softDeletePlan } = useSoftDeletable<TPlan>(config.plansKey)
  const { all: allLogs, items: logs, softDelete: softDeleteLog } = useSoftDeletable<TLog>(config.logsKey)
  const events = useEventBus()

  const syncBus = useSyncBus()
  watch(syncBus.pullSeq, () => {
    allPlans.value = storagGet<TPlan[]>(config.plansKey, [])
    allLogs.value  = storagGet<TLog[]>(config.logsKey, [])
  })
  const syncPlans = useBackendSync(config.plansKey)
  const syncLogs  = useBackendSync(config.logsKey)
  watch(allPlans, v => syncPlans.push(v), { deep: true })
  watch(allLogs,  v => syncLogs.push(v),  { deep: true })

  const activePlans = computed(() => plans.value.filter(p => p.active))

  function createPlan(data: Omit<TPlan, 'id' | 'createdAt' | 'active'>): TPlan {
    const id = crypto.randomUUID()
    const plan = { ...data, id, active: true, createdAt: new Date().toISOString(), updatedAt: Date.now() } as unknown as TPlan
    allPlans.value.push(plan)
    events.emit({
      type: config.planCreatedEvent,
      planId: id,
      title: (data as { title?: string }).title ?? '',
      timestamp: new Date().toISOString(),
    } as Parameters<typeof events.emit>[0])
    return plan
  }

  function updatePlanLink(planId: string, habitId: string | undefined): void {
    const plan = plans.value.find(p => p.id === planId)
    if (plan) { plan.linkedHabitId = habitId; plan.updatedAt = Date.now() }
  }

  function deletePlan(id: string): void {
    // Soft-delete the plan and cascade tombstones to its logs so the removal
    // survives a cross-device merge.
    softDeletePlan(id)
    for (const l of allLogs.value) {
      if (l.planId === id && !l.deletedAt) softDeleteLog(l.id)
    }
  }

  function getPlanById(id: string): TPlan | undefined {
    return plans.value.find(p => p.id === id)
  }

  function addResource<TType extends string>(planId: string, data: { url: string; title: string; type: TType }): void {
    const plan = plans.value.find(p => p.id === planId) as unknown as { resources?: Resource<TType>[]; updatedAt?: number } | undefined
    if (!plan) return
    if (!plan.resources) plan.resources = []
    plan.resources.push({
      id:      crypto.randomUUID(),
      url:     data.url.trim(),
      title:   data.title.trim() || data.url.trim(),
      type:    data.type,
      addedAt: new Date().toISOString(),
      done:    false,
    })
    plan.updatedAt = Date.now()
  }

  function deleteResource(planId: string, resourceId: string): void {
    const plan = plans.value.find(p => p.id === planId) as unknown as { resources?: Resource<string>[]; updatedAt?: number } | undefined
    if (!plan?.resources) return
    plan.resources = plan.resources.filter(r => r.id !== resourceId)
    plan.updatedAt = Date.now()
  }

  function toggleResourceDone(planId: string, resourceId: string): void {
    const plan = plans.value.find(p => p.id === planId) as unknown as { resources?: Resource<string>[]; updatedAt?: number } | undefined
    const res  = plan?.resources?.find(r => r.id === resourceId)
    if (res) { res.done = !res.done; plan!.updatedAt = Date.now() }
  }

  function getPlanResources<TType extends string>(planId: string): Resource<TType>[] {
    const plan = plans.value.find(p => p.id === planId) as unknown as { resources?: Resource<TType>[] } | undefined
    return plan?.resources ?? []
  }

  function exportCsv(opts: {
    filenamePrefix: string
    headers: string[]
    rowsFor: (planId?: string) => TLog[]
    toRow: (log: TLog) => (string | number)[]
  }, planId?: string): void {
    const rows = opts.rowsFor(planId).filter(l => !l.deletedAt)
    if (!rows.length) return

    const lines = [
      opts.headers.join(','),
      ...rows.map(l => opts.toRow(l).join(',')),
    ]

    const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${opts.filenamePrefix}-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return {
    allPlans, plans, allLogs, logs,
    activePlans,
    createPlan, updatePlanLink, deletePlan, getPlanById,
    addResource, deleteResource, toggleResourceDone, getPlanResources,
    exportCsv,
  }
}

export type UsePlanModuleReturn<TPlan extends PlanLike, TLog extends LogLike> = ReturnType<typeof usePlanModule<TPlan, TLog>>
export type { Ref, ComputedRef }
