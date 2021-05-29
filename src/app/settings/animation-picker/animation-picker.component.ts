import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-animation-picker',
  templateUrl: './animation-picker.component.html',
  styleUrls: ['./animation-picker.component.scss'],
})
export class AnimationPickerComponent implements OnInit {
  @Input() animations: Array<string>;
  @Output() onAnimationChange = new EventEmitter<string>();

  @Input() currentAnimation: string;

  constructor() {}

  ngOnInit(): void {}

  onChange() {
    this.onAnimationChange.emit(this.currentAnimation);
  }
}
