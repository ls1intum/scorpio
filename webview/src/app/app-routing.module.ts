import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { CourseSelectionComponent } from './course/course-selection.component';
import { ExerciseSelectionComponent } from './exercise/exercise-selection.component';
import { ProblemStatementComponent } from './problem-statement/problem-statement.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },  // Default route
  { path: 'login', component: LoginComponent },
  { path: 'courses', component: CourseSelectionComponent },
  { path: 'courses/:courseId/exercises', component: ExerciseSelectionComponent },
  { path: 'courses/:courseId/exercises/:exerciseId', component: ProblemStatementComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
