Breath Time

Breath Time is an interactive computational art installation that amplifies the perception of time by translating human breathing into the accelerated growth of tree-ring-like structures.

Project by Feiyang Zhou

Video documentation:
https://vimeo.com/1153485231?share=copy&fl=sv&fe=ci

Introduction

Breath Time is a browser-based interactive artwork that visualizes time through generative tree-ring structures. The system translates human breathing into dynamic visual changes, allowing viewers to experience time not as a linear measurement but as a continuous process of accumulation and consumption.

When no participant interacts with the installation, rings grow slowly and steadily. When a viewer breathes while wearing the sensor belt, the rings grow rapidly and irregularly, creating permanent visual traces that record the moment of bodily intervention.

The project does not attempt to allow viewers to control time. Instead, it amplifies the normally invisible process of time passing through the everyday act of breathing.

Concept

The idea for the project began with brainstorming around the theme of time, including keywords such as:

flow

clocks

pause

gears

history

cycles

During this process, the natural structure of tree rings became an important metaphor. Tree rings represent time not through numbers but through gradual accumulation, recording the life of the tree over many years.

In the early visual research stage, the generative artwork DendroRithms (Creative Applications Network) provided visual inspiration for contour-based ring structures. However, Breath Time focuses on a different conceptual direction: the relationship between body and time.

Philosophical ideas from Taoism and Buddhism also influenced the project. In these traditions, breathing is often associated with the passage of time and the transformation of the world. A single breath connects microscopic bodily experience with a larger temporal scale.

Breath Time translates this idea into an interactive system where breathing becomes a trigger that accelerates visible time.

Hardware Requirements

To exhibit this project, the following hardware is required:

1. Display

A large display screen is recommended.

Recommended specifications:

Minimum resolution: 1920 × 1080

Orientation: landscape

Size: 27 inch or larger

For exhibition, the screen center should be placed approximately 150–160 cm from the ground.

2. Breath Sensor Belt

The breathing sensor is a wearable elastic belt.

The belt contains:

elastic fabric belt

stretchable rubber cord

pins and thread used to secure the cord

connection wires to Arduino

When the participant performs abdominal breathing, the belt stretches and produces an analogue sensor signal.

3. Microcontroller

The sensor belt is connected to an Arduino microcontroller.

Originally the system used:

Arduino Nano

However, due to unstable serial communication during development, the final version was implemented using:

Arduino Mega

The Arduino sends sensor data to the browser via USB serial communication.

4. Computer

Any modern computer capable of running a browser and p5.js can run the project.

Tested configurations include:

MacBook Pro (M1 / M2)

Windows PC with Chrome browser

The computer must be connected to:

the display

the Arduino via USB

Software

The visual system is built using:

p5.js (JavaScript creative coding library)

Web Serial API for Arduino communication

Main features of the software include:

generative tree-ring visual system

real-time breathing data input

burst ring generation triggered by breathing

ring aging effect (outer rings become lighter)

black / white background switching
Interaction

Interaction is designed to be simple and intuitive.

Without interaction

The rings grow slowly over time.

This represents the natural and continuous passage of time.

With breathing

When breathing is detected:

rings grow much faster

multiple rings appear at once

rings become sharper and more irregular

These rings remain permanently in the image, recording the moment of interaction.

Controls

Keyboard shortcuts:

B
Toggle background color (black / white)

R
Reset the system

Fullscreen button
Enter fullscreen display mode

Connect Arduino button
Establish serial communication with the sensor

If Arduino is not connected, the system falls back to mouse interaction simulation.

Calibration

The system requires basic calibration to map breathing intensity to visual change.

Important parameters include:

sensor threshold

smoothing values

burst generation amount

noise intensity

Considerable time during development was spent adjusting these parameters so that small bodily movements could produce perceptible but controlled visual responses.

Exhibition Setup

For installation in a gallery space:

Mount the display on the wall.

Connect the Arduino to the computer via USB.

Ask participants to wear the breathing belt around the abdomen.

Launch the p5.js sketch in the browser.

Switch to fullscreen mode.

Participants should stand approximately 1–2 meters away from the display.

Development Process

The development process involved several stages:

Concept sketches and visual references

Early generative experiments in p5.js

Sensor prototype development

Arduino serial communication testing

Web Serial API integration

Data mapping calibration

Visual refinement of ring structures

Early visual experiments included gradients and color transitions, but these were later simplified into a minimal black-and-white contour style, which better emphasized the temporal structure of the artwork.

References

Conceptual References

Bergson, H. (1910)
Time and Free Will: An Essay on the Immediate Data of Consciousness.

Elias, N. (1992)
Time: An Essay.

Thích Nhất Hạnh (1990)
Breathe! You Are Alive.

Watson, B. (1968)
The Complete Works of Chuang Tzu.

Wu, J.C. (2014)
Daoist Meditation.

Technical References

p5.js
https://p5js.org

Web Serial API
https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API

Arduino Documentation
https://www.arduino.cc

Creative Applications Network
https://www.creativeapplications.net

AI Assistance

ChatGPT (OpenAI) was used during development as a programming assistant to help debug code and resolve technical issues related to p5.js and serial communication. All conceptual design, interaction logic, and visual development were created and implemented by the author.

Author

Feiyang Zhou
MA / MFA Computational Arts