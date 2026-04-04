import { Component, Input, inject } from '@angular/core';
import { Task } from '../../models/task-model';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [],
  templateUrl: './task-item.component.html',
  styleUrl: './task-item.component.css'
})
export class TaskItemComponent {
  // @Input() marks this as a property the parent passes in via [task]="..."
  // { required: true } makes Angular throw a compile error if the parent forgets it
  @Input({ required: true }) task!: Task;

  svc = inject(TaskService);

  // Getter — used in the template like a property, but computed on access
  get isOverdue(): boolean {
    if (!this.task.dueDate || this.task.completed) return false;
    return this.task.dueDate < new Date().toISOString().split('T')[0];
  }

  get dueDateLabel(): string {
    if (!this.task.dueDate) return '';
    const today = new Date().toISOString().split('T')[0];
    const tom   = new Date(); tom.setDate(tom.getDate() + 1);
    const tomorrowStr = tom.toISOString().split('T')[0];

    if (this.task.dueDate === today)       return 'Today';
    if (this.task.dueDate === tomorrowStr) return 'Tomorrow';

    // Use noon to avoid timezone-shift issues
    return new Date(this.task.dueDate + 'T12:00:00')
      .toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}