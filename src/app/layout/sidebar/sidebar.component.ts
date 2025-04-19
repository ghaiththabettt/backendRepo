// sidebar.component.ts
import {
  Component,
  OnInit,
  Inject,
  ElementRef,
  Renderer2,
  HostListener
} from '@angular/core';
import {
  Router,
  NavigationEnd,
  RouterLinkActive,
  RouterLink
} from '@angular/router';
import { DOCUMENT, CommonModule, NgClass } from '@angular/common';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { UnsubscribeOnDestroyAdapter } from '@shared';
import { AuthService, Role } from '@core';
import { SidebarService } from './sidebar.service';
import { RouteInfo } from './sidebar.metadata';

@Component({
  standalone: true,
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  imports: [
    CommonModule,
    RouterLinkActive,
    RouterLink,
    NgClass,
    NgScrollbarModule,
    TranslateModule
  ]
})
export class SidebarComponent extends UnsubscribeOnDestroyAdapter implements OnInit {
  public sidebarItems!: RouteInfo[];
  public innerHeight?: number;
  public bodyTag!: HTMLElement;
  public listMaxHeight?: string;
  public listMaxWidth?: string;
  public userFullName?: string;
  public userImg?: string;
  public userType?: string;
  public headerHeight = 60;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    public elementRef: ElementRef,
    private authService: AuthService,
    private router: Router,
    private sidebarService: SidebarService,
    public translate: TranslateService
  ) {
    super();
    const lang = localStorage.getItem('lang') || 'en';
    translate.setDefaultLang(lang);
    translate.use(lang);
  }

  @HostListener('window:resize', ['$event'])
  windowResizecall() {
    this.setMenuHeight();
    this.checkStatuForResize(false);
  }

  @HostListener('document:mousedown', ['$event'])
  onGlobalClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.renderer.removeClass(this.document.body, 'overlay-open');
    }
  }

  ngOnInit(): void {
    this.bodyTag = this.document.body;
    if (this.authService.currentUserValue) {
      const user = this.authService.currentUserValue;
      const userRole = user.role;

      this.userFullName = user.firstName + ' ' + user.lastName;
      this.userImg = user.img || 'assets/images/user/user.jpg';

      if (userRole === Role.Admin) this.userType = 'Admin';
      else if (userRole === Role.Client) this.userType = 'Client';
      else if (userRole === Role.Employee) this.userType = 'Employee';
      else this.userType = 'User';

      this.subs.sink = this.sidebarService.getRouteInfo().subscribe((routes: RouteInfo[]) => {
        this.sidebarItems = routes.filter(
          (x) => x.role.includes(userRole) || x.role.includes('All')
        );
      });
    }

    this.initLeftSidebar();
  }

  initLeftSidebar() {
    this.setMenuHeight();
    this.checkStatuForResize(true);
    this.subs.sink = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.renderer.removeClass(this.document.body, 'overlay-open');
      }
    });
  }

  setMenuHeight() {
    this.innerHeight = window.innerHeight;
    const height = this.innerHeight - this.headerHeight;
    this.listMaxHeight = height + '';
    this.listMaxWidth = '500px';
  }

  checkStatuForResize(firstTime: boolean) {
    if (window.innerWidth < 1025) {
      this.renderer.addClass(this.document.body, 'ls-closed');
    } else {
      this.renderer.removeClass(this.document.body, 'ls-closed');
    }
  }

  mouseHover() {
    const body = this.elementRef.nativeElement.closest('body');
    if (body.classList.contains('submenu-closed')) {
      this.renderer.addClass(this.document.body, 'side-closed-hover');
      this.renderer.removeClass(this.document.body, 'submenu-closed');
    }
  }

  mouseOut() {
    const body = this.elementRef.nativeElement.closest('body');
    if (body.classList.contains('side-closed-hover')) {
      this.renderer.removeClass(this.document.body, 'side-closed-hover');
      this.renderer.addClass(this.document.body, 'submenu-closed');
    }
  }

  callToggleMenu(event: Event, length: number): void {
    if (length > 0) {
      const parentElement = (event.target as HTMLElement).closest('li');
      const activeClass = parentElement?.classList.contains('active');
      if (activeClass) {
        this.renderer.removeClass(parentElement, 'active');
      } else {
        this.renderer.addClass(parentElement, 'active');
      }
    }
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/authentication/signin']),
      error: (err) => console.error('Erreur lors de la déconnexion:', err)
    });
  }
}