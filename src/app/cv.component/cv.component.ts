import { Component, OnInit } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormArray,
  FormGroup
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from './../UserService';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-cv',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatIconModule
  ],
  standalone: true,
  templateUrl: './cv.component.html',
  styleUrls: ['./cv.component.css']
})
export class CvComponent implements OnInit {

  users: any[] = [];
  page = 1;
  limit = 5;
  editingId: number | null = null;

  // ✅ Proper type
  cvForm!: FormGroup;

  constructor(private fb: FormBuilder, private service: UserService) {}

  ngOnInit(): void {
    this.cvForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      summary: [''],
      experiences: this.fb.array([]),
      education: this.fb.array([]),
      skills: ['']
    });

    this.addExperience();
    this.addEducation();

    this.load();
  }


  load(): void {
    this.service.getUsers(this.page, this.limit)
      .subscribe(res => this.users = res.data);
  }

 
  get experiences(): FormArray {
    return this.cvForm.get('experiences') as FormArray;
  }

  get education(): FormArray {
    return this.cvForm.get('education') as FormArray;
  }


  addExperience(): void {
    this.experiences.push(
      this.fb.group({
        title: ['', Validators.required],
        company: ['', Validators.required],
        start: [''],
        end: ['']
      })
    );
  }


  addEducation(): void {
    this.education.push(
      this.fb.group({
        degree: ['', Validators.required],
        institution: ['', Validators.required],
        year: ['']
      })
    );
  }

 
  submit(): void {

    if (this.cvForm.invalid) return;

    const payload = this.cvForm.value;

    const request$ = this.editingId
      ? this.service.updateUser(this.editingId, payload)
      : this.service.addUser(payload);

    request$.subscribe({
      next: () => {
        this.load();
        this.reset();
      },
      error: err => console.error(err)
    });
  }

 
  edit(user: any): void {

    this.editingId = user.id;

    this.reset();

    this.cvForm.patchValue({
      name: user.name,
      email: user.email,
      phone: user.phone,
      summary: user.summary,
      skills: user.skills
    });

    this.experiences.clear();
    this.education.clear();

    if (user.experiences?.length) {
      user.experiences.forEach((exp: any) => {
        this.experiences.push(this.fb.group({
          title: [exp.title],
          company: [exp.company],
          start: [exp.start],
          end: [exp.end]
        }));
      });
    } else {
      this.addExperience();
    }

    if (user.education?.length) {
      user.education.forEach((edu: any) => {
        this.education.push(this.fb.group({
          degree: [edu.degree],
          institution: [edu.institution],
          year: [edu.year]
        }));
      });
    } else {
      this.addEducation();
    }
  }

  

  delete(id: number): void {
    this.service.deleteUser(id)
      .subscribe(() => this.load());
  }


  generate(user: any): void {
    this.service.generatePdf(user.id);
  }


  reset(): void {
    this.cvForm.reset();
    this.editingId = null;
    this.experiences.clear();
    this.education.clear();

    this.addExperience();
    this.addEducation();
  }

  
  next(): void {
    this.page++;
    this.load();
  }

  prev(): void {
    if (this.page > 1) {
      this.page--;
      this.load();
    }
  }
}