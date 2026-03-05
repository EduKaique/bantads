import { Component, EventEmitter, Output } from '@angular/core';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reject-modal',
  templateUrl: './reject-modal.component.html',
  styleUrls: ['./reject-modal.component.css'],
  imports: [FormsModule]
})
export class RejectModalComponent {
  @Output() confirm = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();
  
  rejectionReason = '';

  onConfirm() {
    if (this.rejectionReason.trim()) {
      this.confirm.emit(this.rejectionReason);
    }
  }
}