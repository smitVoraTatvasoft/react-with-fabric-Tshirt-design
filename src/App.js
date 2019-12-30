import React from "react";
import { fabric } from "fabric";
import domToImage from "dom-to-image";
import tShirtImage from "./images/background_tshirt.png";

import "./App.css";

class App extends React.Component {
  state = {
    canvas: null,
    activeObjectType: null,
    activeTextColor: "black",
    activeBackgroundColor: "#ffffff",
    activeBackgroundImage: null
  };
  c = React.createRef();
  fileRef = React.createRef();
  printDivRef = React.createRef();
  canvas = null;

  componentDidMount() {
    this.canvas = new fabric.Canvas(this.c.current, {});

    this.canvas.on("selection:cleared", e => {
      this.setState({
        activeTextColor: "black",
        activeObjectType: null
      });
    });
    this.canvas.on("selection:created", this.selectionHandler);
    this.canvas.on("selection:updated", this.selectionHandler);
  }

  selectionHandler = e => {
    const type = e.target.get("type");
    this.setState({
      activeObjectType: type
    });
  };

  addNewImage = (event, passFrom) => {
    const file = event.target.files[0];
    if (!file.type.includes("image/")) {
      event.target.value = null;
      alert("Invalid");
      return;
    }
    var reader = new FileReader();
    reader.onload = f => {
      var data = f.target.result;
      switch (passFrom) {
        case "front":
          fabric.Image.fromURL(data, img => {
            img.scaleToHeight(200);
            img.scaleToWidth(150);
            this.canvas.add(img);
          });
          break;
        case "background":
          this.setState({
            activeBackgroundImage: data
          });
          break;
        default:
          break;
      }
    };
    reader.readAsDataURL(file);
    event.target.value = null;
  };

  addTextElement = () => {
    const text = new fabric.IText("Smit");
    this.canvas.add(text);
  };

  removeActiveElement = () => {
    this.canvas.remove(this.canvas.getActiveObject());
  };

  saveImg = () => {
    this.canvas.discardActiveObject().renderAll();
    const node = this.printDivRef.current;
    domToImage
      .toPng(node)
      .then(dataUrl => {
        var iframe =
          "<iframe width='100%' height='100%' src='" + dataUrl + "'></iframe>";
        var x = window.open();
        x.document.open();
        x.document.write(iframe);
        x.document.close();
      })
      .catch(function(error) {
        console.error("oops, something went wrong!", error);
      });
  };

  handleColorChange = (e, passFrom) => {
    const color = e.target.value;
    switch (passFrom) {
      case "text":
        this.canvas.getActiveObject().set("fill", e.target.value);
        this.setState({
          activeTextColor: e.target.value
        });
        this.canvas.renderAll();
        break;
      case "background":
        this.setState({
          activeBackgroundColor: color
        });
        break;
      default:
        break;
    }
  };

  render() {
    const {
      activeTextColor,
      activeObjectType,
      activeBackgroundColor,
      activeBackgroundImage
    } = this.state;
    return (
      <>
        <div
          id="tshirt-div"
          ref={this.printDivRef}
          style={{
            backgroundColor: activeBackgroundColor,
            backgroundImage: `url(${activeBackgroundImage})`,
            backgroundPosition: "center"
          }}
        >
          <img id="tshirt-backgroundpicture" src={tShirtImage} alt="" />
          <div id="drawingArea" className="drawing-area">
            <canvas id="canvas" ref={this.c} width="200" height="400"></canvas>
          </div>
        </div>
        <table>
          <tbody>
            <tr>
              <td>
                {activeObjectType && (
                  <button onClick={this.removeActiveElement}>
                    Remove Active
                  </button>
                )}
              </td>
              <td></td>
            </tr>
            <tr>
              <td>
                <button onClick={this.addTextElement}>Add Text</button>
              </td>
              <td>
                {activeObjectType === "i-text" && (
                  <input
                    type="color"
                    value={activeTextColor}
                    onChange={e => this.handleColorChange(e, "text")}
                  />
                )}
              </td>
            </tr>
            <tr>
              <td> Select image to add:</td>
              <td>
                <input
                  type="file"
                  onChange={e => this.addNewImage(e, "front")}
                  accept="image/x-png,image/gif,image/jpeg"
                />
              </td>
            </tr>
            <tr>
              <td> Select image for background:</td>
              <td>
                <input
                  type="file"
                  onChange={e => this.addNewImage(e, "background")}
                  accept="image/x-png,image/gif,image/jpeg"
                />
              </td>
            </tr>
            <tr>
              <td> T-shirt color:</td>
              <td>
                <input
                  type="color"
                  value={activeBackgroundColor}
                  onChange={e => this.handleColorChange(e, "background")}
                />
              </td>
            </tr>
          </tbody>
        </table>
        <button onClick={this.saveImg}>save</button>
      </>
    );
  }
}

export default App;
