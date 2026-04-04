import { Component, computed, inject, signal } from '@angular/core';
import { Task } from '../../models/task-model';
import { TaskService } from '../../services/task.service';
import { TaskItemComponent } from '../task-item/task-item.component';
import { AddTaskComponent } from '../add-task/add-task.component';

type Tab            = 'all' | 'active' | 'completed';
type PriorityFilter = 'all' | 'low' | 'medium' | 'high';

@Component({
  selector: 'app-task-board',
  standalone: true,
  imports: [TaskItemComponent, AddTaskComponent],
  templateUrl: './task-board.component.html',
  styleUrl: './task-board.component.css'
})
export class TaskBoardComponent {
  // inject() is the modern alternative to constructor injection
  svc = inject(TaskService);

  // ─── UI state (signals) ──────────────────────────────────────────────────
  tab       = signal<Tab>('all');
  priority  = signal<PriorityFilter>('all');
  showModal = signal(false);

  // ─── Typed option arrays for template @for loops ─────────────────────────
  tabs: { value: Tab; label: string }[] = [
    { value: 'all',       label: 'All'       },
    { value: 'active',    label: 'Active'    },
    { value: 'completed', label: 'Completed' }
  ];

  priorities: { value: PriorityFilter; label: string }[] = [
    { value: 'all',    label: 'All'    },
    { value: 'high',   label: 'High'   },
    { value: 'medium', label: 'Medium' },
    { value: 'low',    label: 'Low'    }
  ];

  // ─── Derived filtered + sorted list ──────────────────────────────────────
  // computed() reads from three signals: svc.tasks(), tab(), priority()
  // Angular tracks those dependencies and re-runs this automatically
  filteredTasks = computed<Task[]>(() => {
    let list = this.svc.tasks();

    if (this.tab() === 'active')    list = list.filter(t => !t.completed);
    if (this.tab() === 'completed') list = list.filter(t =>  t.completed);
    if (this.priority() !== 'all')  list = list.filter(t => t.priority === this.priority());

    // Sort: incomplete first → soonest due date → oldest created
    return [...list].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
      if (a.dueDate) return -1;
      if (b.dueDate) return  1;
      return a.createdAt.localeCompare(b.createdAt);
    });
  });
}