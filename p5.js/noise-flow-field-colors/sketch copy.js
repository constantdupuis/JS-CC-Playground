


let particles = [];
let particlesCount = 4000;
let noiseSpeed = 20;
let alivedPaticlesCount = particlesCount;

//let colorScale = chroma.scale(['#DEF9C4', '#468585']);
//let colorScale = chroma.scale(['#D6EFD8', '#1A5319']);
//let colorScale = chroma.scale(['#EEEEEE', '#DC5F00']);
//let colorScale = chroma.scale(['#DAD3BE', '#002125']);
//let colorScale = chroma.scale(['#002125', '#DAD3BE']); // 10/10
//let colorScale = chroma.scale(['#DAD3BE', '#002125']);
//let colorScale = chroma.scale(['#00112A', '#6BDFDB']);

//let colorScale = chroma.scale(['#173B45', '#B43F3F', '#FF8225', '#F8EDED']); // 8/10
let colorScale = chroma.scale(['#F8EDED', '#FF8225', '#B43F3F','#173B45' ]);
//let colorScale = chroma.scale(['#B5C18E', '#F7DCB9', '#DEAC80', '#914F1E']);

//let colorScale = chroma.scale(['#FF0000', '#00FF00']);

function keyPressed() {
  if ((key == 'S') || (key == 's')) {
    console.time('Save canvas to png');
    saveCanvas('colored-noise-flow-field.jpg');
    console.timeEnd('Save canvas to png');
  }
}

function setup() {

    //createCanvas(1600, 2560);
    //createCanvas(800, 800);
    createCanvas(1600, 900);
    angleMode(DEGREES);

    // Noise settings
    // noiseSeed(195735482);
    // noiseDetail(3, 0.5);

    NoiseMapGenerate(width, height);
    NoiseMapShowStats();
    NoiseMapNormalize();
    NoiseMapShowStats();

    for( x = 0; x < particlesCount; x++)
    {
      const p = new Particle(random(width), random(height));

      //const p = new Particle(width * 0.5, height * 0.95);
      //p.setVelocity( random() * 100, random() * 100);
      p.setTimeToLive(500 + random(500));
      //p.setTimeToLive(220 + random(220));
      //p.setTimeToLive(120 + random(120));
      //p.setTimeToLive(60 + random(60));
      //p.setTimeToLive(30 + random(30));
      //p.setTimeToLive(5);
      particles.push(p);
    }
    let c = color(colorScale(0.0).alpha(1.0).hex());
    background(c);
    hideDoneMarker();
    //NoiseMapDraw();
    // Turn off the draw loop.
    //noLoop();
}

function draw() {
  
  //stroke(0, 32);
  noStroke();
  //noFill();
  //fill(0, 8);
  //let colorRampIndex = random(0.25,1);
  //let c = color(colorScale(0.25+colorRampIndex).alpha(0.1).hex());
  //fill(c);
  let c;
  for( x = 0; x < particlesCount; x++)
  {
    const p = particles[x];
    if( p.isAlive ){
      //point(p.x, p.y);
      //console.log(`Particle ${x} ttl01 ${p.ttl01}`);
      c = color(colorScale(p.ttl01).alpha(0.1).hex());
      fill(c);
      circle(p.x, p.y, 2);
      //console.log("particule  : " + x + " pos x : "  + p.x + " y : " + p.y);
      //console.log("deltaTime  : " + deltaTime);
      const n = NoiseMapGetAt(p.x, p.y);
      //console.log("noise pour particule  : " + x + "  = "  + n);
      const vx = cos(n*360) * noiseSpeed;
      const vy = sin(n*360) * noiseSpeed;
      //console.log("new velocity x : " + vx + "  y :"  + vy);
      p.setVelocity(vx, vy);
      //p.update(deltaTime);
      p.update(100);
      KeepInside(p);
    }
    else 
    {
      if( alivedPaticlesCount > 0)
        alivedPaticlesCount--;
      if( alivedPaticlesCount === 0)
      {
        console.log('All particles are dead, stop looping');
        noLoop();
        showDoneMarker();
        break;
      }
    }

  }
  //NoiseMapDraw();
}

 // Function to show the element
 function showDoneMarker() {
  document.getElementById('doneMarker').style.display = 'block';
}

// Function to hide the element
function hideDoneMarker() {
  document.getElementById('doneMarker').style.display = 'none';
}

function KeepInside(p)
{
  if( p.x < 0 || p.x > width || p.y < 0 || p.y > height)
  {
    p.x = random(width);
    p.y = random(height);
  }
}

let noiseMap = [];
let noiseMapWidth = 0;
let noiseMapHeight = 0;
let noiseMapSize = 0;
let noiseScale = 0.0035;// 0.003
let noiseOctaveNumber = 3;
let noiseOctaveFalloff = 0.5;
let noiseMapSeed = -1; //48462321; //49852321
let noiseMapMaxNoise = 0;
let noiseMapMinNoise = 1;

function NoiseMapGenerate(nmWidth, nmHeight)
{
  console.time('generate noisemap');
  noiseMap = [];
  noiseMapWidth = nmWidth;
  noiseMapHeight = nmHeight;
  noiseMapSize = noiseMapWidth * noiseMapHeight;
  noiseMapMaxNoise = 0;
  noiseMapMinNoise = 1;

  noiseDetail(noiseOctaveNumber, noiseOctaveFalloff);
  if( noiseMapSeed != -1)
    noiseSeed(noiseMapSeed);

  for( let i = 0; i < noiseMapWidth; i++)
  {
    for( let j = 0; j < noiseMapHeight; j++)
    {
      const noiseIndex = (j * noiseMapWidth) + i;
      const noiseVal = noise( i * noiseScale, j * noiseScale);

      if( noiseVal > noiseMapMaxNoise) noiseMapMaxNoise = noiseVal;
      if( noiseVal < noiseMapMinNoise) noiseMapMinNoise = noiseVal;

      noiseMap[noiseIndex] = noiseVal;
    }
  }
  console.timeEnd('generate noisemap');
}

function NoiseMapGetAt(x,y)
{
  x = floor(x);
  y = floor(y);
  if( noiseMapSize == 0) return -1;
  const noiseIndex = (y * width) + x;
  if( noiseIndex < noiseMapSize)
  {
    return noiseMap[noiseIndex];
  }
  return -1;
}

function NoiseMapDraw()
{
  console.time("draw noise map");
  for( let i =0; i < width; i++)
    for(let j = 0; j < height; j++)
  {
    let n = 255 * NoiseMapGetAt(i,j);
    
    stroke(n);
    point(i,j);
  }
  console.timeEnd("draw noise map");
}

function NoiseMapShowStats()
{
  console.log("Noise Map ");
  console.log("Noise Min :  " + noiseMapMinNoise);
  console.log("Noise Max :  " + noiseMapMaxNoise);
}

function NoiseMapNormalize()
{
  console.time('Normalize NoiseMap');
  for( let i = 0; i < noiseMapWidth; i++)
    {
      for( let j = 0; j < noiseMapHeight; j++)
      {
        const noiseIndex = (j * noiseMapWidth) + i;
         
        noiseMap[noiseIndex] = map( noiseMap[noiseIndex], noiseMapMinNoise, noiseMapMaxNoise, 0, 1 );
      }
    }
    noiseMapMinNoise = 0;
    noiseMapMaxNoise = 1;
    console.timeEnd('Normalize NoiseMap');
}
