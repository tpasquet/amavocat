import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Post } from 'src/app/global/interfaces';

@Component({
  selector: 'app-post-card',
  templateUrl: './post-card.component.html',
  styleUrls: ['./post-card.component.scss']
})
export class PostCardComponent {
  @Input() post!: Post;
  @Output() readPostClicked = new EventEmitter<Post>();

  constructor() { }
  
  onReadPostClicked(post: Post) {
    this.readPostClicked.emit(post);
  }

}
