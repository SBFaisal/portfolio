import { Injectable } from '@angular/core';
import { of, shareReplay } from 'rxjs';
import { PortfolioData } from '../models/portfolio-data.model';
import portfolioData from '../../../assets/portfolio-data.json';

@Injectable({
  providedIn: 'root'
})
export class PortfolioDataService {
  readonly data$ = of(portfolioData as PortfolioData).pipe(shareReplay(1));
}
