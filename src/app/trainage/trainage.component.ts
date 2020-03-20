import {Component, OnInit, ViewChild , ViewEncapsulation} from '@angular/core';
import * as tf from '@tensorflow/tfjs';
import {categoricalCrossentropy} from '@tensorflow/tfjs-layers/dist/exports_metrics';
import {MatTable, MatPaginator, MatTableDataSource} from '@angular/material';
import {MatSnackBar} from '@angular/material';

export interface TrainingImageList 
{
  ImageSrc: string;
  LabelX1: number;
  LabelX2: number;
  Class: string;
};
export interface TrainingMetrics 
{
  acc: number;
  ce: number;
  loss: number;
};

@Component({
  selector: 'app-trainage',
  templateUrl: './trainage.component.html',
  styleUrls: ['./trainage.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class TrainageComponent implements OnInit {

 private isImagesListed: Boolean;
	private isImagesListPerformed: Boolean;
  
  constructor(private snackBar: MatSnackBar) {}

  private picture: HTMLImageElement;
  
  public tableRows: TrainingImageList[]=[]; //instance of TrainingImageList 
  public dataSource = new MatTableDataSource<TrainingImageList>(this.tableRows);  //datasourse as
  public traningMetrics: TrainingMetrics[]=[]; //instance of TrainingMetrics

  public displayedColumns: string[] = ['ImageSrc','Class','Label_X1','Label_X2'];
  
  private csvContent: any;

  private label_x1: number[]=[];
  private label_x2: number[]=[];
  public ProgressBarValue: number;
  
  @ViewChild(MatTable, {static: false}) table: MatTable<any>;
  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
 
  ngOnInit()
  {   
    this.isImagesListed=false;
    this.isImagesListPerformed=false;
    this.ProgressBarValue=0;
  }
  async train()
  { 
    const {images, targets} = this.generateData(this.csvContent,114);
    this.ProgressBarValue=35;
    this.openSnackBar("Images are loaded into the memory as tensor !","Close");

    const mobilenetModified = await this.getModifiedMobilenet();
    this.ProgressBarValue=50;
    this.openSnackBar("Modefiled Mobilenet AI Model is loaded !","Close");
    
    await this.fineTuneModifiedModel(mobilenetModified,images,targets);
    this.openSnackBar("Model training is completed !","Close");
    this.ProgressBarValue=100;
  }
  async loadCSV()
  { 
    this.parseImages(138);

    if (this.isImagesListPerformed)
    {
      this.openSnackBar("Training images are listed !","Close");
    }
    if (!this.isImagesListPerformed)
    {
      this.openSnackBar("Please reset the dataset to upload new CSV file !","Reset");
    }
  }
  reset()
  {
  
  };
  async getModifiedMobilenet()
  {
    const trainableLayers = ['denseModified','conv_pw_13_bn','conv_pw_13','conv_dw_13_bn','conv_dw_13'];
    const mobilenet =  await tf.loadLayersModel('https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json');
    console.log('Mobilenet model is loaded')

    const x = mobilenet.getLayer('global_average_pooling2d_1');
    const predictions = <tf.SymbolicTensor> tf.layers.dense({units: 2, activation: 'softmax',name: 'denseModified'}).apply(x.output);
    let mobilenetModified = tf.model({inputs: mobilenet.input, outputs: predictions, name: 'modelModified' });
    console.log('Mobilenet model is modified')
  
    mobilenetModified = this.freezeModelLayers(trainableLayers,mobilenetModified)
    console.log('ModifiedMobilenet model layers are freezed')

    mobilenetModified.compile({loss: categoricalCrossentropy, optimizer: tf.train.adam(1e-3), metrics: ['accuracy','crossentropy']});


    return mobilenetModified 
  }
  freezeModelLayers(trainableLayers,mobilenetModified)
  {
    for (const layer of mobilenetModified.layers) 
    {
      layer.trainable = false;
      for (const tobeTrained of trainableLayers) 
      {
        if (layer.name.indexOf(tobeTrained) === 0) 
        {
          layer.trainable = true;
          break;
        }
      }
    }
    return mobilenetModified;
  }
  async fineTuneModifiedModel(model,images,targets)
  {
    function onBatchEnd(batch, logs) 
    {
      console.log('Accuracy', logs.acc);
      console.log('CrossEntropy', logs.ce);
      console.log('All', logs);
    }
    console.log('Finetuning the model...');
    await model.fit(images, targets, 
    {
    	epochs: 100,
      batchSize: 24,
      validationSplit: 0.2,
      callbacks: {onBatchEnd}
    }).then(info => {
      console.log('Final accuracy', info.history.acc);
      console.log('Cross entropy', info.ce);
      console.log('All', info);
      console.log('All', info.history['acc'][0]);
      for ( let k = 0; k < 100; k++) 
	    {
	      this.traningMetrics.push({acc: 0, ce: 0 , loss: 0});
	      this.traningMetrics[k].acc=info.history['acc'][k];
	      this.traningMetrics[k].ce=info.history['ce'][k];
	      this.traningMetrics[k].loss=info.history['loss'][k]; 
	    }
	    model.save('downloads://agemodel');
      images.dispose();
      targets.dispose();
      model.dispose();
    });
  }
  parseImages(batchSize)
  {
    if (this.isImagesListed) 
    {
      this.isImagesListPerformed=false;
      return;
    }

    let allTextLines = this.csvContent.split(/\r|\n|\r/);
    const csvSeparator = ',';
    const csvSeparator_2 = '.';
    for ( let i = 0; i < batchSize; i++) 
    {
    	if (allTextLines[i] != undefined) {
    		const cols: string[] = allTextLines[i].split(csvSeparator);

			this.tableRows.push({ImageSrc: '', LabelX1: 0 , LabelX2: 0 ,Class: ''});

			if (cols[0].split(csvSeparator_2)[1]=="jpg") 
			{  

				if (cols[1] == "male") 
				{ 
				  this.label_x1.push(Number('1'));
				  this.label_x2.push(Number('0'));
				  this.tableRows[i].ImageSrc="../assets/"+ cols[0];
				  this.tableRows[i].LabelX1=1;
				  this.tableRows[i].LabelX2=0;
				  this.tableRows[i].Class="male";
				} 

				if (cols[1]=="female") 
				{ 
				  this.label_x1.push(Number('0'));
				  this.label_x2.push(Number('1'));
				  this.tableRows[i].ImageSrc="../assets/"+ cols[0];
				  this.tableRows[i].LabelX1=0;
				  this.tableRows[i].LabelX2=1;
				  this.tableRows[i].Class="female";
				} 

			}
    	}
		 
    }
    this.table.renderRows();
    this.dataSource.paginator = this.paginator;
    this.isImagesListed=true;
    this.isImagesListPerformed=true;
  }
  generateData (trainData,batchSize)
  {
    const imageTensors = [];
    const targetTensors = [];

    let allTextLines = this.csvContent.split(/\r|\n|\r/);
    
    const csvSeparator = ',';
    const csvSeparator_2 = '.';
    
    for ( let i = 0; i < batchSize; i++) 
    {
    	if (allTextLines[i] != undefined) {
	      const cols: string[] = allTextLines[i].split(csvSeparator);
	      if (cols[0].split(csvSeparator_2)[1]=="jpg") 
	      {
	        const imageTensor = this.capture(i);
	        let targetTensor =tf.tensor1d([this.label_x1[i],this.label_x2[i]]);

	        targetTensor.print();
	        imageTensors.push(imageTensor);
	        targetTensors.push(targetTensor);
	  
	        imageTensor.print(true);
	      } 
	    }
    }
    
    const images = tf.stack(imageTensors);
    const targets = tf.stack(targetTensors);   

    return {images, targets};
  }
  capture(imgId) 
  {
    this.picture = <HTMLImageElement> document.getElementById(imgId);
    const trainImage = tf.browser.fromPixels(this.picture);
    const trainim = trainImage.toFloat().div(tf.scalar(127)).sub(tf.scalar(1));

    return trainim;
  }
  onFileLoad(fileLoadedEvent) 
  {
    const textFromFileLoaded = fileLoadedEvent.target.result;              
    this.csvContent = textFromFileLoaded;  
  }
  onFileSelect(input: HTMLInputElement) 
  {
    const files = input.files;
    
    if (files && files.length) 
    {
      const fileToRead = files[0];

      const fileReader: FileReader = new FileReader();
      fileReader.onload = (event: Event) => {     
        const textFromFileLoaded = fileReader.result;              
        this.csvContent = textFromFileLoaded;   }

      fileReader.readAsText(fileToRead, "UTF-8");
    }
  }
  getTotalMale() 
  {
    return this.tableRows.map(t => t.LabelX1).reduce((acc, value) => acc + value, 0);
  };
  getTotalFemale() 
  {
    return this.tableRows.map(t => t.LabelX2).reduce((acc, value) => acc + value, 0);
  };
  openSnackBar(message: string, action: string) 
  {
    this.snackBar.open(message, action, {duration: 4000});
  }

}
