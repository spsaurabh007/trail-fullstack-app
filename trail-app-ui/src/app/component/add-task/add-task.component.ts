import { Component, Output, EventEmitter, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { Priority } from '../../models/task-model';

@Component({
  selector: 'app-add-task',
  standalone: true,
  imports: [ReactiveFormsModule],  // Must import this to use formGroup / formControlName
  templateUrl: './add-task.component.html',
  styleUrl: './add-task.component.css'
})
export class AddTaskComponent {
  // @Output + EventEmitter: how this child notifies its parent (TaskBoardComponent)
  // The parent listens with (close)="showModal.set(false)"
  @Output() close = new EventEmitter<void>();

  private fb  = inject(FormBuilder);
  private svc = inject(TaskService);

  categories: string[]  = ['Work', 'Personal', 'Learning', 'Shopping', 'Health'];
  priorities: Priority[] = ['high', 'medium', 'low'];

  // FormBuilder creates a FormGroup — the model for the entire form
  // Validators run on every change and determine form validity
  form = this.fb.group({
    title:       ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    priority:    ['medium' as Priority, Validators.required],
    category:    ['Work', Validators.required],
    dueDate:     ['' as string]
  });

  // Convenience getter to avoid repeating form.get('title')! in the template
  get titleCtrl() { return this.form.get('title')!; }

  submit(): void {
    if (this.form.invalid) {
      // Touch all fields so validation errors show even without user interaction
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.value;
    this.svc.addTask({
      title:       v.title!.trim(),
      description: v.description?.trim() ?? '',
      priority:    v.priority as Priority,
      category:    v.category!,
      dueDate:     v.dueDate || null
    });
    this.close.emit();
  }
}