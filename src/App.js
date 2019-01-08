// TO DO:
// Allow adding of types in edit mode
// allow for easy adding of new columns
// add confirmation before deleting
import Checkbox from 'material-ui/Checkbox';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import React, { Component } from 'react';
import {Toolbar, ToolbarGroup} from 'material-ui/Toolbar';
import ReactTable from 'react-table';
import 'react-bootstrap-table';
import 'react-table/react-table.css';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import ModalYesNoDialog from 'modalyesnodialog';
import 'modalyesnodialog/src/components/ModalYesNoDialog.css';

/*
const MobileDetect = require('mobile-detect');
const md = new MobileDetect(window.navigator.userAgent);
const isMobile=md.mobile();
*/

class App extends Component {
     constructor() {
          super();
          
          this.state = {
               data: null,
               editMode: false,
               fetchComplete: false,
               types: null,
               addName: "",
               addURL: "",
               addType: "",
               addDuration: "",
               showDialog: false, // when true, dialog is visible
               dialogTitle: null,
               dialogDescription: null,
               dialogFirstButtonText: null,
               dialogSecondButtonText: null,
          }

          this.cancelButtonClick = this.cancelButtonClick.bind(this);
          this.deleteCheched = this.deleteChecked.bind(this);
          this.dialogHandler = this.dialogHandler.bind(this);
          this.editButtonClick = this.editButtonClick.bind(this);
          this.fetchData = this.fetchData.bind(this);
          this.renderEditable = this.renderEditable.bind(this);
          this.typeChanged = this.typeChanged.bind(this);
     }
     
     componentWillMount() {
         this.fetchData();
     }
     
     addRowButtonClick() {
          if (this.state.addName === "") {
               this.showDialog("Add Link","Please enter the name",this.dialogHandler,"","Ok");
               return;
          }
          
          if (this.state.addURL === "") {
               this.showDialog("Add Link","Please enter the URL",this.dialogHandler,"","Ok");               
               return;
          }
 
          
          if (this.state.addURL.indexOf("http://") !== 0 && this.state.addURL.indexOf("https://") !== 0) {
               this.showDialog("Add Link","You must enter a URL",this.dialogHandler,"","Ok");               
               return;
          }

          if (this.state.addType === "") {
               this.showDialog("Add Link","Please select the type",this.dialogHandler,"","Ok");               
               return;
          }
 
          this.insertRow(this.state.addName,this.state.addURL,this.state.addType,this.addDuration);
          
          this.setState({addName : ""});
          this.setState({addURL : ""});
          this.setState({addType : ""});
          this.setState({addDuration : ""});
     }

     cancelButtonClick() {
          this.setState({editMode : !this.state.editMode});
 
          // Reload the data discarding any change made in edit modes
          this.fetchData();
     }
   
     deleteChecked(e,index) {
          var data = [...this.state.data];

          data[index].DeleteRow=!data[index].DeleteRow;
          this.setState({data : data});
          return;
     }

     deleteRow(rowID) {
          // Call the REST endpoint to delete the specified row
	  fetch('/LinkData.php?task=deleteRow&LinkID=' + rowID, {method: 'GET',dataType:'json'}).then(response => response.json()).then((response) => {
               if (response["Error"] != null)
                    throw new Error("An error occurred deleting the row with the ID " + rowID + " with the error " + response["Error"]);

               // Comment this out when you want to view the payload data of the AJAX request in the browser
               // console.log("Successfull call for the types with response: " + response.length);
          }).catch(error => { 
               console.log('Call to deleteRow failed', error); 
               throw new Error("An error occurred calling deleteRow with the error" + error);
          });
     }

     dialogHandler(dialogResponse) {
          if (this.state.showModalDialog === false) {
               return;
          }
          
          // Use this if you need to do something based on the dialog response button that was clicked
          /*if (dialogResponse.currentTarget.textContent==="Yes") {  
          } else {
          }*/

          this.setState({showDialog : false});
     }

     editButtonClick(e) {
          // When going from view to edit, prepare the add fields
          if (this.state.editMode === false) {
               // Clear all of these fields initially
               this.setState({addName : ""});
               this.setState({addType : ""});
               this.setState({addURL : ""});
               this.setState({addDuration : ""});
          } else { // when saving, commit rows that were modified to the DB
               // Loop through each row and update all rows that have been modified
               const data = [...this.state.data];
                                  
               for (var item in data) {
                    // If the row was selected to be deleted
                    if (data[item].DeleteRow === true) {
                         this.deleteRow(data[item].ID);
                    }

                    // In order to know which rows have been modified, I set the modified flag to true whenever a field is changed
                    //if (data[item].Modified === true) {
                        // Since I don't have to a way to know which specific column was updated, I have to update all columns
                        this.updateRow(data[item].ID,"Name",data[item].Name);
                        this.updateRow(data[item].ID,"URL",data[item].URL);
                        this.updateRow(data[item].ID,"TypeID",data[item].Type);
                        this.updateRow(data[item].ID,"Duration",data[item].Duration);
                    //}
               }
          }

          // When going from view mode to edit mode, toggle editMode state
          if (this.state.editMode === false) { 
               this.setState({editMode : !this.state.editMode});
          } else { // Otherwise, we are going from edit mode to view only mode, in which case we want to reload the data
               this.setState({editMode : !this.state.editMode}, () => this.fetchData());
          }
     } 

     fetchData() {
          // Calling the REST endpoint in dev mode doesn't work so set fake data
          if (process.env.NODE_ENV === 'development') {

               this.setState({types : [{"id":"6","value":"All"},{"id":"4","value":"Document"},{"id":"5","value":"Jokes"},{"id":"2","value":"Song"},{"id":"1","value":"Video"},{"id":"3","value":"Website"}]});

               this.setState({data : [{"ID":"5","Name":"First Look at Yemenite Jews","URL":'https:\\\\www.haaretz.com\\israel-news\\MAGAZINE-first-ever-photos-of-yemen-s-jews-s',"Type":"Website","DeleteRow":0,"Modified":0}]});
               return;          
          }

          // Call the REST endpoint to get the tpes
	  fetch('/LinkData.php?task=fetchTypes', {method: 'GET',dataType:'json'}).then(response => response.json()).then((response) => {
               // Comment this out when you want to view the payload data of the AJAX request in the browser
               // console.log("Successfull call for the types with response: " + response.length);
               
               if (response["Error"] != null)
                    throw new Error("An error occurred getting the types with the error " + response["Error"]);

               this.setState({types : response});
               
               fetch('/LinkData.php?task=fetchData', {method: 'GET',dataType:'json'}).then(response => response.json()).then((response) => {
                    if (response["Error"] != null)
                         throw new Error("An error occurred getting the data with the error " + response["Error"]);

                    // Comment this out when you want to view the payload data of the AJAX request in the browser
                    // console.log("Successfull call for the types with response: " + response);
                     this.setState({data : response});
               
                    this.setState({fetchComplete : true});
               }).catch(error => { 
                    console.log('Call to fetch data failed', error); 
                    // alert("An error occurred generating the menu while getting the data. Please contact the system administrator");
                    throw new Error("An error occurred generating the menu while getting the data" + error);
               });
          }).catch(error => { 
               console.log('Call to fetch failed', error); 
               // alert("An error occurred generating the menu while getting the types. Please contact the system administrator");
               throw new Error("An error occurred calling fetch" + error);
          });
     }
     
     insertRow(Name,URL,Type,Duration) {
          // Call the REST endpoint to get the tpes
	  fetch('/LinkData.php?task=insertRow&Name=' + encodeURIComponent(Name) + "&URL=" + encodeURIComponent(URL) + "&Type=" + encodeURIComponent(Type) + "&Duration=" + encodeURIComponent(Duration), {method: 'GET',dataType:'json'}).then(response => response.json()).then((response) => {
               // Comment this out when you want to view the payload data of the AJAX request in the browser
               // console.log("Successfull call for the types with response: " + response.length);
               if (response["Error"] != null)
                    throw new Error("An error occurred inserting a row with the error " + response["Error"]);

               // fetch the data again
               this.fetchData();
          }).catch(error => { 
               console.log('Call to fetch failed', error); 
               // alert("An error occurred generating the menu while getting the types. Please contact the system administrator");
               throw new Error("An error occurred calling fetch" + error);
          });
     }

     render() {
          // Don't render anything until the types and data have been retrieved
          if (this.state.fetchComplete===false) {
               return <div></div>
          }

          const typesOptions = Object.keys(this.state.types).map(key => this.renderTypes(key)); 

          const editModeColumns = [
          {
               Header: 'ID',
               accessor: 'ID',
               Cell: this.renderEditable,
               maxWidth: 32,
          }, {
               Header: 'Name',
               accessor: 'Name',
               Cell: this.renderEditable,
               minWidth: 375,
          }, {
               Header: 'URL',
               accessor: 'URL',
               Cell: this.renderEditable,
               minWidth: 500,
          }, {
               Header: 'Type',
               accessor: 'Type',
               Cell: this.renderEditable,
               minWidth: 145,
          }, {
               Header: 'Duration',
               accessor: 'Duration',
               Cell: this.renderEditable,
          }, {
               Header: 'Delete',
               accessor: 'DeleteRow',
               Cell: this.renderEditable,
               minWidth: 32,
          }, {
          }]

          const viewOnlyColumns = [
          {
               Header: 'ID',
               accessor: 'ID',
               Cell: this.renderEditable,
               maxWidth: 32,
               filterMethod: (filter,row) => 
               row[filter.id]=filter.value
          }, {
               Header: 'Name',
               accessor: 'Name',
               Cell: this.renderEditable,
               minWidth: 375,
               filterMethod: (filter,row) => 
               row[filter.id].toLowerCase().indexOf(filter.value.toLowerCase()) !== -1 
          }, {
               Header: 'URL',
               accessor: 'URL',
               Cell: this.renderEditable,
               minWidth: 500,
               filterMethod: (filter,row) => row[filter.id].toLowerCase().indexOf(filter.value.toLowerCase()) !== -1 
          }, {
               Header: 'Type',
               accessor: 'Type',
               Cell: this.renderEditable,
               minWidth: 145,
               filterMethod: (filter, row) => {
                    if (filter.value === "All") {
                         return true;
                    }
                    
                    return row[filter.id] === filter.value;
               },
          Filter: ({ filter, onChange }) =>
               <select onChange={event => onChange(event.target.value)} style={{ width: "100%" }} value={filter ? filter.value : "All"} >
                    {typesOptions}
               </select>
          }, {
               Header: 'Duration',
               accessor: 'Duration',
               Cell: this.renderEditable,
               minWidth: 100,
               filterMethod: (filter,row) => 
               row[filter.id].toLowerCase().indexOf(filter.value.toLowerCase()) !== -1 
          }]

          const cancelButtonStyle = {
               backgroundColor:'lightgray',
               marginLeft: '35px'
          };
          
          const editButtonStyle = {
               backgroundColor:'lightgray'
          };
          
          const leftMarginStyle = {
               marginLeft: '5px'
          };

          const titleStyle = {
               marginLeft: '50%'
          }
          
          const editButtonText = (this.state.editMode === false ? "Edit" : "Save");
          const cancelButton = (this.state.editMode === false ? <div></div> : <RaisedButton primary={true} label="Cancel" style={cancelButtonStyle} onClick={this.cancelButtonClick} />);

          // The type dropdown in the add panel shouldn't have All as an option. Passing true as a 2nd parameter to renderTypes excludes All as an option 
          const typesOptionsNoAll = Object.keys(this.state.types).map(key => this.renderTypes(key,true)); 

          /*
                     <SelectField floatingLabelText="Type" value={this.state.addType} onChange={(event, value) => {this.setState({addType: value})}}>
                          {typesOptions}
                     </SelectField>
          */

          const addPanel = (this.state.editMode === false ? <div></div> : 
               <Paper zDepth={2}>
                     Name: <TextField hintText="Name" value={this.state.addName} onChange={(event, value) => {this.setState({addName: value})}} />
                     URL: <TextField hintText="URL" value={this.state.addURL} onChange={(event, value) => {this.setState({addURL: value})}} />
                     Type:
                          <select value={this.state.addType} onChange={(event, value) => {this.setState({addType: event.target.value})}}>
                               {typesOptionsNoAll}
                          </select>
                     Duration: <TextField hintText="Duration" value={this.state.addDuration} onChange={(event, value) => {this.setState({addDuration: value})}} />
                    <RaisedButton primary={true} label="Add" style={leftMarginStyle} onClick={(event) => {this.addRowButtonClick(event)}} />
                    {(this.state.showDialog === true ? <ModalYesNoDialog isVisible={true} title={this.state.dialogTitle} description={this.state.dialogDescription} eventHandler={this.dialogHandler} firstButtonText={(this.state.dialogFirstButtonText != null ? this.state.dialogFirstButtonText : "No")} secondButtonText={(this.state.dialogSecondButtonText != null ? this.state.dialogSecondButtonText : "Yes")}></ModalYesNoDialog> : "")}
               </Paper>
          );


          return (
               <MuiThemeProvider>
                    <Toolbar>
                         <ToolbarGroup style={titleStyle} firstChild={true}>
                         <span>Aba's Links</span>
                         </ToolbarGroup>
                    </Toolbar>
                    <Paper zDepth={5}> 
                    <RaisedButton primary={true} label={editButtonText} style={editButtonStyle} onClick={(event) => {this.editButtonClick(event)}} />
                    {cancelButton}
                    <br />
                    {addPanel}
                    <div>
                    </div> 

                    <ReactTable
                         getTdProps={(state, rowInfo, column, instance) => {
                              return {
                                   onBlur: (e, handleOriginal) => {
                                        const data = [...this.state.data];
                                  
                                        for (var item in data) {
                                             if (data[item].ID===rowInfo.row.ID) {
                                                  data[item].Modified=1;
                                                  this.setState({data});
                                             }
                                        }
                                   }
                              }
                         }}
                         data={this.state.data}
                         columns={(this.state.editMode === false ? viewOnlyColumns : editModeColumns)}
                         filterable={!this.state.editMode}
                         sortable
                         defaultPageSize={50} 
                         style={{
                              height: "400px"
                         }}
 
                         className="-striped -highlight"
                    />
               </Paper> 
               </MuiThemeProvider>
          );
     }
     
     renderEditable(cellInfo) {
          // ID shouldn't ever be editable
          if (cellInfo.column.id==="ID") {
               return cellInfo.value;
          }
          
          // When we aren't in edit mode, return just the value (or in case of the URL a hyperlink)
          if (this.state.editMode===false) {
              switch(cellInfo.column.id) {
                   case "Name":
                        return cellInfo.value;
                   case "URL":
                        return <a href={cellInfo.value} target="_blank">{cellInfo.value}</a>; // Custom cell component
                   case "Duration":
                        return cellInfo.value;
                   default:
                        return cellInfo.value;
              } 
          }
          
          // When we are in edit mode, render the type is a dropdown 
          if (cellInfo.column.id==="Type") {
               const typesOptions = Object.keys(this.state.types).map(key => this.renderTypes(key)); 

                    /*<SelectField floatingLabelText="Type" onChange={event => {this.typeChanged(event,cellInfo.index)}} style={{ width: "100%" }} defaultValue={cellInfo.value} >
                         {typesOptions}
                    </SelectField>*/
               return (
                    <select onChange={event => {this.typeChanged(event,cellInfo.index)}} style={{ width: "100%" }} defaultValue={cellInfo.value} >
                         {typesOptions}
                    </select>
               )
          }
       
          if (cellInfo.column.id==="DeleteRow") {
               return (
                    <Checkbox label="" onCheck={event => {this.deleteChecked(event,cellInfo.index)}} />
               )
          }

          return (
               <div style={{ backgroundColor: "#fafafa",borderStyle: "solid",borderColor: "black" }}
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={e => {
                         const data = [...this.state.data];
                         data[cellInfo.index][cellInfo.column.id] = e.target.innerHTML;
                         data[cellInfo.index].Modified=1;
                         this.setState({data});
                    }}
                    dangerouslySetInnerHTML={{
                         __html: this.state.data[cellInfo.index][cellInfo.column.id]
                    }}
               />
          );
     }
    
     renderTypes(i,noAll) {
          // When noAll is provided, don't add All to the dropdown and render a blank item instead. This is used for the add type dropdown
          if (noAll === true && this.state.types[i].value === "All") {
               return <option key={i} value={this.state.types[i].value}></option>
          }

               // <option key={i} value={this.state.types[i].value}>{this.state.types[i].value}</option>
               // <MenuItem value={this.state.types[i].value}>{this.state.types[i].value}</MenuItem>
          return (
               <option key={i} value={this.state.types[i].value}>{this.state.types[i].value}</option>
          );
     }
       
     // Show modal dialog
     showDialog(title,description,eventHandler,firstButtonText,secondButtonText) {
          this.setState({
            dialogTitle : title,
            dialogDescription : description,
            dialogFirstButtonText : firstButtonText,
            dialogSecondButtonText : secondButtonText,
            showDialog : true,
          });
     }

     // Since Type is rendered as a select dropdown in edit mode, we have to manually set the value when it changes     
     typeChanged(e,index) {
          var data = [...this.state.data]; 
          data[index].Type=e.target.value;
          data[index].Modified=1;
          this.setState({data : data});
     } 
     
     updateRow(rowID,columnName,columnValue) {
          // Call the REST endpoint to update the specified row
	  fetch('/LinkData.php?task=updateRow&rowID=' + rowID + '&columnName=' + columnName + '&columnValue=' + encodeURIComponent(columnValue), {method: 'GET',dataType:'json'}).then(response => response.json()).then((response) => {
               if (response["Error"] != null)
                    throw new Error("An error occurred updating the row with the name " + columnName + " with the error " + response["Error"]);

               // Comment this out when you want to view the payload data of the AJAX request in the browser
               // console.log("Successfull call for the types with response: " + response.length);
               
               // Reload the data so any newly added rows will show the corresponding ID
               this.fetchData();
          }).catch(error => { 
               console.log('Call to updateRow failed', error); 
               // alert("An error occurred updating the row");
               throw new Error("An error occurred calling updateRow with the error" + error);
          });
     }
}

export default App;
