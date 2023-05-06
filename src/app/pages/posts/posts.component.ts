import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Post } from 'src/app/global/interfaces';
import { PostService } from 'src/app/services/post.service';

@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.scss']
})
export class PostsComponent {
  posts$: Observable<Post[]>

  constructor(private router: Router, private postService: PostService) { 
    this.posts$ = this.postService.getAllPosts();
  }

  goToPost(post: Post) {
    this.router.navigateByUrl('/posts/' + post.uid);
  }
}
