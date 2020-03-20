import {Component, OnInit, ViewChild , ViewEncapsulation} from '@angular/core';
import * as tf from '@tensorflow/tfjs';
import {categoricalCrossentropy} from '@tensorflow/tfjs-layers/dist/exports_metrics';
import {MatTable, MatPaginator, MatTableDataSource} from '@angular/material';
const MODEL_URL = 'http://127.0.0.1/bibliogestapi/model/nombre.json';
const MODEL_SEX_URL = 'http://127.0.0.1/bibliogestapi/model/agemodel.json';
import {MatSnackBar} from '@angular/material';

@Component({
  selector: 'app-testpredict',
  templateUrl: './testpredict.component.html',
  styleUrls: ['./testpredict.component.css']
})
export class TestpredictComponent implements OnInit {
	private picture: HTMLImageElement;
	cam = false;
	urlimage = "";
	personnevalide = false;
  constructor(private snackBar: MatSnackBar) { }

  ngOnInit() {
  }
  async onFileSelect(input: HTMLInputElement) 
  {
  	var data = await this.readerf(input, fileloades);
  	
  	function fileloades(data, error) {
  		var imas = <HTMLImageElement> document.getElementById("imagetest");
  		imas.src = data;
  	}
  	this.cam = true;
  }
  async restt(){
  	this.personnevalide = false;
  	this.cam = false;
  }
  async readerf(input, calback){
  	const files = input.files;
  	if (files && files.length) 
    {
		const fileToRead = files[0];
		const fileReader = new FileReader();
		fileReader.onload = function(){   
			calback(fileReader.result, null);
    	}
		fileReader.readAsDataURL(fileToRead);
    }
  }
  async faitpredict(){
  	const imageTensors = [];
  	const imageTensor = this.capture("imagetest");
  	imageTensors.push(imageTensor);
  	imageTensor.print(true);
  	const model = await tf.loadLayersModel(MODEL_URL);
  	const images = tf.stack(imageTensors);
    console.log(images);
  	const predictions = model.predict(images) as tf.Tensor;
    console.log(predictions);
  	predictions.array().then(data => {
  		if (parseFloat(data[0][0]) > parseFloat(data[0][1]) && parseFloat(data[0][0]) > parseFloat(data[0][2])) {
  			this.personnevalide = true;
  			this.openSnackBar("Il y a une seule personne sur le photo!","Close");
  		}
  		else if (parseFloat(data[0][0]) < parseFloat(data[0][1]) && parseFloat(data[0][1]) > parseFloat(data[0][2])) {
  			this.openSnackBar("Il y a plusieur personnes sur le photo!","Close");
  		}
  		else{
  			this.openSnackBar("Il y a aucune personne sur la photo!","Close");
  		}
  	});
	
  }
  capture(imgId) 
  {
    this.picture = <HTMLImageElement> document.getElementById(imgId);
    const trainImage = tf.browser.fromPixels(this.picture);
    const trainim = trainImage.toFloat().div(tf.scalar(127)).sub(tf.scalar(1));
    
    return trainim;
  }
  openSnackBar(message: string, action: string) 
  {
    this.snackBar.open(message, action, {duration: 4000});
  }
  async getsexe(){
  	const imageTensors = [];
  	const imageTensor = this.capture("imagetest");
  	imageTensors.push(imageTensor);
  	imageTensor.print(true);
  	const model = await tf.loadLayersModel(MODEL_SEX_URL);
  	const images = tf.stack(imageTensors);
	const predictions = model.predict(images) as tf.Tensor;
	predictions.array().then(data => {
		console.log(data)
		if (parseFloat(data[0][0]) > parseFloat(data[0][1])) {
			this.openSnackBar("Sexe masculin!","Close");
		}
		else{
			this.openSnackBar("Sexe Feminin!","Close");
		}
	});
  }
}
