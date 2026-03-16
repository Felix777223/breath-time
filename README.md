# Breath Time

**Breath Time** is an interactive computational art project that visualises time through the growth of generative tree-ring structures.

The system translates human breathing into visual changes, allowing viewers to experience time not as a linear measurement but as a continuous process of accumulation.

Video documentation:  
https://vimeo.com/1153485231

---

# Project Description

Breath Time explores the relationship between **human breathing and the perception of time**.

Tree rings are used as a visual metaphor for time. In nature, tree rings slowly accumulate over years, recording the life of the tree. In this project, generative ring structures are continuously produced on the screen.

Without interaction, the rings grow slowly.  
When a viewer breathes using the sensor belt, the rings grow rapidly and irregularly, creating permanent visual traces.

The work amplifies the normally invisible process of time passing through the everyday act of breathing.

---

# Interaction

When no one interacts with the installation:

- rings grow slowly
- time appears calm and continuous

When breathing is detected:

- multiple rings appear rapidly
- rings become sharper and irregular
- the system records the moment of bodily intervention

Keyboard controls:

**B** – toggle black / white background  
**R** – reset the system  

---

# Hardware Requirements

To run the interactive version of the project the following hardware is required:

- Arduino microcontroller  
- Stretchable breathing belt sensor  
- Computer running a browser
- Display screen

The breathing belt contains a stretchable rubber cord that reacts to abdominal breathing movement. The stretching of the belt produces analogue sensor values that are sent to the computer through the Arduino.

---

# Software

The visual system is built using:

- **p5.js**
- **JavaScript**
- **Web Serial API**
- **Arduino**

The p5.js sketch generates the visual tree-ring structures and maps breathing data to visual changes.

---

# Running the Project

To run the project locally:

1. Download or clone this repository.
2. Open `index.html` in a web browser.
3. Click **Connect Arduino** if the sensor is connected.
4. Interact with the system by breathing with the sensor belt.

If no Arduino is connected, the system can still run in simulation mode.

---

# Files

Main project files:
