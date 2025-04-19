import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/service/auth.service';
import { Role } from '../../core/models/role';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-locked',
  templateUrl: './locked.component.html',
  styleUrls: ['./locked.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule
  ]
})
export class LockedComponent implements OnInit {
  authForm!: UntypedFormGroup;
  submitted = false;
  userImg!: string;
  userName!: string;
  hide = true;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      this.userImg = currentUser.img || 'assets/images/user/user.jpg';
      this.userName = currentUser.firstName + ' ' + currentUser.lastName;
    } else {
      this.router.navigate(['/authentication/signin']);
    }
    this.authForm = this.formBuilder.group({
      password: ['', Validators.required],
    });
  }

  get f() {
    return this.authForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    if (this.authForm.invalid) {
      return;
    }

    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      const role = currentUser.role;
      if (role === Role.Admin) {
        this.router.navigate(['/admin/dashboard/main']);
      } else if (role === Role.Employee) {
        this.router.navigate(['/employee/dashboard']);
      } else if (role === Role.Client) {
        this.router.navigate(['/client/dashboard']);
      } else {
        this.router.navigate(['/authentication/signin']);
      }
    } else {
      this.router.navigate(['/authentication/signin']);
    }
  }
}
