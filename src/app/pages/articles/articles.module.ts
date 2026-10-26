import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LayoutModule } from 'src/app/modules/layout.module';
import { ArticleCardComponent } from './article-card/article-card.component';
import { ArticleDetailComponent } from './article-detail/article-detail.component';
import { ArticleListComponent } from './article-list/article-list.component';
import { ArticleService } from './article.service';

const routes: Routes = [
  { path: '', component: ArticleListComponent },
  { path: ':slug', component: ArticleDetailComponent },
];

@NgModule({
  declarations: [ArticleListComponent, ArticleDetailComponent, ArticleCardComponent],
  imports: [CommonModule, TranslateModule, LayoutModule, RouterModule.forChild(routes)],
  providers: [ArticleService],
})
export class ArticlesModule {}
