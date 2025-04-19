// src/app/authentication/signin/signin.component.ts
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Role } from '../../core/models/role';
import { AuthService } from '../../core/service/auth.service';
import { UnsubscribeOnDestroyAdapter } from '../../shared/UnsubscribeOnDestroyAdapter';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule
  ]
})
export class SigninComponent extends UnsubscribeOnDestroyAdapter implements OnInit {
  authForm!: UntypedFormGroup;
  submitted = false;
  loading = false;
  error = '';
  hide = true;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    super();
  }

  ngOnInit() {
    this.authForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  get f() {
    return this.authForm.controls;
  }

  adminSet() {
    this.authForm.get('email')?.setValue('admin@example.com');
    this.authForm.get('password')?.setValue('admin123');
  }

  employeeSet() {
    this.authForm.get('email')?.setValue('employee@example.com');
    this.authForm.get('password')?.setValue('employee123');
  }

  clientSet() {
    this.authForm.get('email')?.setValue('client@example.com');
    this.authForm.get('password')?.setValue('client123');
  }

  onSubmit() {
    this.submitted = true;
    this.loading = true;
    this.error = '';

    if (this.authForm.invalid) {
      this.error = 'Email et mot de passe requis';
      this.loading = false;
      return;
    }

    this.subs.sink = this.authService
      .login(this.f['email'].value, this.f['password'].value)
      .subscribe({
        next: (user) => {
          if (user) {
            const role = user.role;
            if (role === Role.Admin) {
              this.router.navigate(['/admin/dashboard/main']);
            } else if (role === Role.Employee) {
              this.router.navigate(['/employee/dashboard']);
            } else if (role === Role.Client) {
              this.router.navigate(['/client/dashboard']);
            } else {
              this.router.navigate(['/authentication/signin']);
            }
          }
          this.loading = false;
        },
        error: (error) => {
          this.error = error;
          this.loading = false;
          console.error('Erreur de connexion:', error);
        }
      });
  }
}
