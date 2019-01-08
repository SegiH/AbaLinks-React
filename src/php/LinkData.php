<?php

$results = array();

// Change this to your own Mysql Login info
$database_username="abalinks";
$database_password="xsX3~n#HPdN~Z33";
$database_host="localhost";
$database_name="abalinks";
$table_name="abalinks";

// Try to connect
$connect = new mysqli($database_host,$database_username,$database_password,$database_name); 

// Make sure DB connect worked
if (!$connect) {
     error_occurred("Connection to DB failed");
}

if (!isset($_GET["task"])) {
     error_occurred("Task not provided");
}

if(!mysqli_set_charset($connect, 'utf8')) {
    error_occurred("The connection is not in UTF8");
}

switch($_GET["task"]) {
     case "deleteRow":
          if (!isset($_GET["LinkID"])) {
               error_occurred("Link ID not provided");
          }

          if ($stmt = $connect->prepare("DELETE FROM AbaLinks WHERE LinkID=?")) {
               $stmt->bind_param("i", $_GET["LinkID"]);

               $stmt->execute();

               $stmt->close();
               
               die(json_encode("ok"));
          } else {
               error_occurred("Unable to add the entry");
          }

          break;
     case "fetchData": // fetch the data 
          $sql = "SELECT * FROM AbaLinks LEFT JOIN LinkTypes ON LinkTypeID=TypeID ORDER BY Name";
          break;
     case "fetchTypes": // fetch the link types
          $sql="SELECT * FROM LinkTypes Order by LinkTypeName";
          break;
     case "insertRow": 
          if (!isset($_GET["Name"])) {
               error_occurred("Name is not provided");
          }
          
          if (!isset($_GET["URL"])) {
               error_occurred("URL is not provided");
          }
          
          if (!isset($_GET["Type"])) {
               error_occurred("Type is not provided");
          }
          
          $duration="";

          if (!isset($_GET["Duration"])) {
               $duration=cleanStr($_GET["Duration"]);
          }
           
          $typeID=0;

          if ($stmt = $connect->prepare("SELECT LinkTypeID FROM LinkTypes WHERE LinkTypeName = ?")) {
               $stmt->bind_param("s", $_GET["Type"]);

               $stmt->execute();

               $stmt->bind_result($typeID);

               $stmt->fetch();

               $stmt->close();
          } else {
               error_occurred("Unable to get Type ID");
          }
          
          if ($stmt = $connect->prepare("INSERT INTO AbaLinks(Name,URL,TypeID,Duration) VALUES(?,?,?,?)")) {
               $stmt->bind_param("ssi", $_GET["Name"],$_GET["URL"],$typeID,$duration);

               $stmt->execute();

               $stmt->close();
               
               die(json_encode("ok"));
          } else {
               error_occurred("Unable to add the entry");
          }

          die(json_encode(array("OK" => "")));
     case "updateRow": // update a row
          if (!isset($_GET["rowID"])) {
               error_occurred("Row ID not provided");
          }
          
          if (!isset($_GET["columnName"])) {
               error_occurred("Column name not provided");
          }
          
          if (!isset($_GET["columnValue"])) {
               error_occurred("Column value not provided");
          }
       
          $columnName="";

          if ($_GET["columnName"] == "Name" || $_GET["columnName"] == "URL" || $_GET["columnName"] == 'TypeID' || $_GET["columnName"] == "Duration") {
               $columnName=$_GET['columnName'];
          } else {
               error_occurred("Unknown column name");
          }
          
          if ( $_GET["columnName"] == 'TypeID') {
               if ($stmt = $connect->prepare("SELECT LinkTypeID FROM LinkTypes WHERE LinkTypeName = ?")) {
                    $stmt->bind_param("s", $_GET["columnValue"]);

                    $stmt->execute();

                    $stmt->bind_result($columnValue);

                    $stmt->fetch();

                    $stmt->close();
               } else {
                    error_occurred("Unable to get Type ID");
               }
          } else {
               $columnValue=$_GET["columnValue"];
          }
 
          if ($stmt = $connect->prepare("UPDATE AbaLinks LEFT JOIN LinkTypes ON LinkTypeID=TypeID SET " . $columnName . " = ? WHERE LinkID=?")) {
               $stmt->bind_param("si", $columnValue,$_GET["rowID"]);

               $stmt->execute();

               $stmt->close();
  
               die(json_encode(array("OK" => "")));
          } else {
               error_occurred(mysqli_error($connect));
          }
     default:
          error_occurred("Unknown type " . $_GET["task"]);
}

$result = $connect->query($sql);

if ($result->num_rows > 0) {
     // output data of each row
     while($row = $result->fetch_assoc()) {
          switch($_GET["task"]) {
               case "fetchData":
                    $arr=array('ID' => $row["LinkID"],'Name' => $row["Name"],'URL' => $row["URL"],'Type' => $row["LinkTypeName"],'Duration' => cleanStr($row["Duration"]),'DeleteRow' => 0,'Modified' => 0);
                    break;
               case "fetchTypes":
                    $arr=array('id'=> $row["LinkTypeID"],'value'=>$row["LinkTypeName"]);
                    break;
          }
         
          array_push($results,$arr);
     }
}

$connect->close();

die(json_encode($results));

function cleanStr($str) {
     // Strip HTML tags
     $str=strip_tags($str);

     // Clean up things like &amp
     $str=html_entity_decode($str);
 
     // Strip out any URL encoded stuff
     $str=urldecode($str);

     // Trim leading and trailing white space
     $str=trim($str);

     return $str;
}

function error_occurred($msg) {
    global $connect;

    if ($connect) $connect->close();

    die(json_encode(array("Error" => $msg))); 
}
?>
