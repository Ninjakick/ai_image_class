import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TestpredictComponent } from './testpredict/testpredict.component';
import { TrainingComponent } from './training/training.component'
import { TrainageComponent } from './trainage/trainage.component'
const routes: Routes = [
	{path: 'testpredict', component: TestpredictComponent},
	{path: 'trainage', component: TrainageComponent},
	{path: '', component: TrainingComponent}
  ];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
