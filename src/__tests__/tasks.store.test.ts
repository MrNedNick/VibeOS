import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useTasksStore } from '@/modules/task-manager/stores/tasks.store'

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
})

describe('useTasksStore — task management', () => {
  it('starts with no tasks', () => {
    const store = useTasksStore()
    expect(store.tasks).toHaveLength(0)
  })

  it('addTask creates a pending task', () => {
    const store = useTasksStore()
    store.addTask('Write tests')
    expect(store.tasks).toHaveLength(1)
    expect(store.tasks[0].text).toBe('Write tests')
    expect(store.tasks[0].done).toBe(false)
  })

  it('addTask trims whitespace', () => {
    const store = useTasksStore()
    store.addTask('  spaces around  ')
    expect(store.tasks[0].text).toBe('spaces around')
  })

  it('toggleTask marks a task done', () => {
    const store = useTasksStore()
    store.addTask('Buy groceries')
    const id = store.tasks[0].id
    store.toggleTask(id)
    expect(store.tasks[0].done).toBe(true)
    expect(store.tasks[0].completedAt).toBeTruthy()
  })

  it('toggleTask undoes a completed task', () => {
    const store = useTasksStore()
    store.addTask('Buy groceries')
    const id = store.tasks[0].id
    store.toggleTask(id)
    store.toggleTask(id)
    expect(store.tasks[0].done).toBe(false)
    expect(store.tasks[0].completedAt).toBeUndefined()
  })

  it('deleteTask removes the task', () => {
    const store = useTasksStore()
    store.addTask('To delete')
    store.addTask('To keep')
    const id = store.tasks[0].id
    store.deleteTask(id)
    expect(store.tasks).toHaveLength(1)
    expect(store.tasks[0].text).toBe('To keep')
  })
})

describe('useTasksStore — status filter', () => {
  it('filter all returns every task', () => {
    const store = useTasksStore()
    store.addTask('A')
    store.addTask('B')
    store.setFilter('all')
    expect(store.filteredTasks).toHaveLength(2)
  })

  it('filter active excludes done tasks', () => {
    const store = useTasksStore()
    store.addTask('Active')
    store.addTask('Done')
    store.toggleTask(store.tasks[1].id)
    store.setFilter('active')
    expect(store.filteredTasks).toHaveLength(1)
    expect(store.filteredTasks[0].text).toBe('Active')
  })

  it('filter done shows only completed tasks', () => {
    const store = useTasksStore()
    store.addTask('Active')
    store.addTask('Done')
    store.toggleTask(store.tasks[1].id)
    store.setFilter('done')
    expect(store.filteredTasks).toHaveLength(1)
    expect(store.filteredTasks[0].text).toBe('Done')
  })

  it('filter today shows only undone tasks due today', () => {
    const store = useTasksStore()
    const today = new Date().toISOString().slice(0, 10)
    store.addTask('Due today', 'none', today)
    store.addTask('Due tomorrow', 'none', '2099-12-31')
    store.addTask('No due date')
    store.setFilter('today')
    expect(store.filteredTasks).toHaveLength(1)
    expect(store.filteredTasks[0].text).toBe('Due today')
  })
})

describe('useTasksStore — category filter', () => {
  it('setCategoryFilter all shows all tasks', () => {
    const store = useTasksStore()
    store.addTask('Work', 'none', undefined, 'work')
    store.addTask('Personal', 'none', undefined, 'personal')
    store.setCategoryFilter('all')
    expect(store.filteredTasks).toHaveLength(2)
  })

  it('setCategoryFilter work shows only work tasks', () => {
    const store = useTasksStore()
    store.addTask('Work task', 'none', undefined, 'work')
    store.addTask('Personal task', 'none', undefined, 'personal')
    store.addTask('No category')
    store.setCategoryFilter('work')
    expect(store.filteredTasks).toHaveLength(1)
    expect(store.filteredTasks[0].text).toBe('Work task')
  })

  it('category + status filters combine', () => {
    const store = useTasksStore()
    store.addTask('Work active', 'none', undefined, 'work')
    store.addTask('Work done', 'none', undefined, 'work')
    store.addTask('Learning active', 'none', undefined, 'learning')
    store.toggleTask(store.tasks[1].id) // mark 'Work done' as done
    store.setFilter('active')
    store.setCategoryFilter('work')
    expect(store.filteredTasks).toHaveLength(1)
    expect(store.filteredTasks[0].text).toBe('Work active')
  })
})

describe('useTasksStore — computed counts', () => {
  it('activeCount reflects undone tasks only', () => {
    const store = useTasksStore()
    store.addTask('A')
    store.addTask('B')
    store.toggleTask(store.tasks[0].id)
    expect(store.activeCount).toBe(1)
  })

  it('progress is 0 when empty', () => {
    expect(useTasksStore().progress).toBe(0)
  })

  it('progress calculates done / total correctly', () => {
    const store = useTasksStore()
    store.addTask('A')
    store.addTask('B')
    store.addTask('C')
    store.addTask('D')
    store.toggleTask(store.tasks[0].id)
    expect(store.progress).toBe(25)
  })
})
