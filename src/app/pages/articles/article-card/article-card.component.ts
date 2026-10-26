import { Component, Input } from '@angular/core';
import { SupportedLanguages } from 'src/app/global/enum';
import { Article } from 'src/app/global/interfaces';
import { formatArticleDate } from '../format-date';

@Component({
  selector: 'app-article-card',
  templateUrl: './article-card.component.html',
  styleUrls: ['./article-card.component.scss'],
  standalone: false
})
export class ArticleCardComponent {
  @Input({ required: true }) article!: Article;
  @Input({ required: true }) lang!: SupportedLanguages;

  get date(): string {
    return formatArticleDate(this.article.publishedAt, this.lang);
  }
}
