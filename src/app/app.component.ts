import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from './service/auth.service';
import { StorageService } from './service/storage.service';
import { filter } from 'rxjs/operators';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'HA-Digital';
  isSwiped = false;
  touchStartX = 0;
  isUserLoggedIn = false;
  isGrayTheme = true;
  sectionsStatus: any = {};
  currentPath: string = '';
  storageCheckInterval: Subscription | null = null;
logins=false;
  constructor(
    private authService: AuthService, 
    private router: Router,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    this.loadTheme();
    this.loadSectionsStatus();
this.authService.logins=this.logins
console.log(this.authService.logins);
    this.authService.isAuthenticated().subscribe(isLoggedIn => {
      this.isUserLoggedIn = isLoggedIn;
    });

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentPath = event.urlAfterRedirects;
      });

    this.startStorageCheckInterval();
  }

  ngOnDestroy(): void {
    this.authService.logins=this.logins
console.log(this.authService.logins);
    this.stopStorageCheckInterval();
  }

  startStorageCheckInterval(): void {
    this.storageCheckInterval = interval(10000).subscribe(() => {
      this.storageService.checkLocalStorageSpace();
    });
  }

  stopStorageCheckInterval(): void {
    if (this.storageCheckInterval) {
      this.storageCheckInterval.unsubscribe();
      this.storageCheckInterval = null;
    }
  }

  navigateToSection(section: string) {
    switch (section) {
      case 'dashboard':
        const cachedData = this.getCachedData('auftragsnummer');
        if (cachedData) {
          this.router.navigate([`/dashboard/${cachedData}`]);
        } else {
          this.router.navigate(['/dashboard']);
        }
        break;
      case 'last-action':
        this.router.navigate(['/last-action']);
        break;
      case 'logout':
        this.logout();
        break;
      default:
        this.router.navigate([section]);
        break;
    }
  }

  getCachedData(key: string) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
    window.location.reload();
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.touches[0].clientX;
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent) {
    const touchEndX = event.touches[0].clientX;
    const diffX = this.touchStartX - touchEndX;

    if (diffX > 50) {
      this.isSwiped = true;
    } else if (diffX < -50) {
      this.isSwiped = false;
    }

    this.updateButtonStates();
  }

  updateButtonStates() {
    const buttons = document.querySelectorAll('.swipe-button');
    buttons.forEach(button => {
      if (this.isSwiped) {
        button.classList.add('expanded');
      } else {
        button.classList.remove('expanded');
      }
    });
  }

  toggleTheme(): void {
    this.isGrayTheme = !this.isGrayTheme;
    this.applyTheme();
    localStorage.setItem('isGrayTheme', JSON.stringify(this.isGrayTheme));
  }

  loadTheme(): void {
    const savedTheme = localStorage.getItem('isGrayTheme');
    if (savedTheme) {
      this.isGrayTheme = JSON.parse(savedTheme);
    }
    this.applyTheme();
  }

  applyTheme(): void {
    document.body.classList.toggle('gray-theme', this.isGrayTheme);
    document.body.classList.toggle('white-theme', !this.isGrayTheme);
  }

  loadSectionsStatus(): void {
    const savedStatus = localStorage.getItem('sectionsStatus');
    if (savedStatus) {
      this.sectionsStatus = JSON.parse(savedStatus);
    }
  }

  updateSectionStatus(section: string, status: string): void {
    this.sectionsStatus[section] = status;
    localStorage.setItem('sectionsStatus', JSON.stringify(this.sectionsStatus));
  }

  getSectionClass(section: string): string {
    const status = this.sectionsStatus[section];
    if (status === 'completed') {
      return 'completed';
    } else if (status === 'in-progress') {
      return 'in-progress';
    } else {
      return 'not-started';
    }
  }

  isCurrentSection(section: string): boolean {
    return this.currentPath.includes(section);
  }

  getButtonClasses(section: string): any {
    return {
      'active': this.isCurrentSection(section),
      'completed': this.getSectionClass(section) === 'completed',
      'in-progress': this.getSectionClass(section) === 'in-progress',
      'not-started': this.getSectionClass(section) === 'not-started'
    };
  }

  Sections: any[] = [
    { path: 'PruefungWarePackmittelComponent', icon: 'done_all', label: 'Prüfung Ware/Packmittel' },
    { path: 'AusschussFotograferenComponent', icon: 'camera', label: 'Ausschuss Fotografieren' },
    { path: 'KontrollwaageKalibrierenComponent', icon: 'balance', label: 'Kontrollwaage Kalibrieren' },
    { path: 'NachweisKuehiketteComponent', icon: 'list', label: 'Nachweis Kühlkette' },
    { path: 'ProzessSchritteLinienComponent', icon: 'sync_problem', label: 'Prozess Schritte Linien' },
    { path: 'PruefgewichtErmittelnComponent', icon: 'scale', label: 'Prüfgewicht Ermitteln' },
    { path: 'VariableDruckdatenComponent', icon: 'language', label: 'Variable Druckdaten' },
    { path: 'WareneingangspruefungComponent', icon: 'check_circle', label: 'Wareneingangsprüfung' },
    { path: 'PruefungBilanzierungComponent', icon: 'search', label: 'Prüfung Bilanzierung' },
    { path: 'VernichtungsprotokollComponent', icon: 'delete_forever', label: 'Vernichtungsprotokoll' }
  ];
}
