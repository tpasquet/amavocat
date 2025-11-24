import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { Post } from 'src/app/global/interfaces';
import { PostService } from 'src/app/services/post.service';

@Component({
    selector: 'app-post-details',
    templateUrl: './post-details.component.html',
    styleUrls: ['./post-details.component.scss'],
    standalone: false
})
export class PostDetailsComponent {
  post$?: Observable<Post>;

  routeSub: Subscription;
  updateSubmitted: boolean = false;

  constructor(
    private postService: PostService,
    private route: ActivatedRoute
  ) {
    this.routeSub = this.route.params.subscribe(params => {
      this.post$ = this.postService.getPost(params["id"]);
    });
  }

  ngOnInit() { }

}
