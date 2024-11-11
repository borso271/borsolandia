function getRandomColor() {
    // Generate a random hex color
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
let color1, color2, color3;
function setRandomColors() {
     color1 = getRandomColor();
     color2 = getRandomColor();
     color3 = getRandomColor();
     document.body.style.backgroundColor = color1;


    console.log(`Random colors chosen:\nColor 1: ${color1}\nColor 2: ${color2}\nColor 3: ${color3}`);
}

// Run the function
setRandomColors();
color1 = "#151515";
color3 = "red";
color2 = "#e8eddf"
 document.body.style.backgroundColor = color1;

 document.body.style.backgroundColor = color1;

export const immovablecolor = color1;
export const immovableborder = color2;;//#fffcf9"; //"#20a39e";

export const wallcolor = color2; //immovableborder; //"white";
export const wallborder = color1;//color1;
export const pavementcolor =color1;
export const pavementinner = immovableborder;
export const playercolor = color2;
export const exitcolor = playercolor;