import { Injectable, signal, computed } from '@angular/core';
import { Task, Priority } from '../models/task-model';

// This type is used when adding a new task — we generate id, completed, createdAt ourselves
export type NewTask = Omit<Task, 'id' | 'completed' | 'createdAt'>;

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly STORAGE_KEY = 'ng-tasks';

  // ─── Core state ────────────────────────────────────────────────────────────
  // signal() is Angular's reactive primitive (like useState in React, but better)
  // Any template or computed() that reads tasks() auto-updates when it changes
  tasks = signal<Task[]>(this.loadFromStorage());

  // ─── Derived state ─────────────────────────────────────────────────────────
  // computed() re-runs only when its dependencies (tasks) change
  totalCount     = computed(() => this.tasks().length);
  completedCount = computed(() => this.tasks().filter(t => t.completed).length);
  activeCount    = computed(() => this.tasks().filter(t => !t.completed).length);
  overdueCount   = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    return this.tasks().filter(t => !t.completed && !!t.dueDate && t.dueDate < today).length;
  });

  // ─── Mutations ─────────────────────────────────────────────────────────────

  addTask(task: NewTask): void {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      completed: false,
      createdAt: new Date().toISOString()
    };
    // update() receives the current value and returns the next value
    this.tasks.update(tasks => [...tasks, newTask]);
    this.persist();
  }

  toggleComplete(id: string): void {
    this.tasks.update(tasks =>
      tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    );
    this.persist();
  }

  deleteTask(id: string): void {
    this.tasks.update(tasks => tasks.filter(t => t.id !== id));
    this.persist();
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  private persist(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.tasks()));
  }

  private loadFromStorage(): Task[] {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : seedData();
    } catch {
      return seedData();
    }
  }
}

// ─── Seed data (first load only) ─────────────────────────────────────────────

function seedData(): Task[] {
  const fmt  = (d: Date) => d.toISOString().split('T')[0];
  const d    = (offset: number) => { const dt = new Date(); dt.setDate(dt.getDate() + offset); return fmt(dt); };
  const now  = new Date().toISOString();

  return [
    { id: '1', title: 'Set up Angular project',    description: 'Install CLI and scaffold workspace',                    priority: 'high',   category: 'Work',     dueDate: d(-1), completed: true,  createdAt: now },
    { id: '2', title: 'Learn Angular signals',      description: 'Understand signal(), computed(), and effect()',         priority: 'high',   category: 'Learning', dueDate: d(1),  completed: false, createdAt: now },
    { id: '3', title: 'Build task manager UI',      description: 'Wire up components, service, and reactive forms',       priority: 'medium', category: 'Work',     dueDate: d(0),  completed: false, createdAt: now },
    { id: '4', title: 'Review reactive forms',      description: 'FormBuilder, Validators, and form state management',    priority: 'medium', category: 'Learning', dueDate: d(3),  completed: false, createdAt: now },
    { id: '5', title: 'Buy groceries',              description: 'Milk, eggs, bread',                                     priority: 'low',    category: 'Personal', dueDate: null,  completed: false, createdAt: now },
  ];
}