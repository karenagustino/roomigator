## roomigator

# Inspiration
One of our busybody teammates gets asked for directions almost every other day at UBC. One time, a freshman student in his wheelchair came up and asked, “Do you know where the Great Hall Forum is? I’m new to this building and am running late to an event.” Our teammate decided to guide him into finding the nearest elevator and had a quick chat about how frustrating it has been for the student to navigate around campus within buildings. Our teammate wanted to make a change; thus, it became the start of Roomigator.

# What it does
Roomigator is a web application that guides people into finding the most efficient and accessible-friendly route indoors!

# How we built it
We use TypeScript, Next.js, React, and Tailwind.CSS to design the front-end interface, as well as Figma to design each of our graphic elements (as well as navGator!). As for the backend interface, we also use Next.js for routing capabilities, TypeScript for type-safety, and Supabase and PostgresSQL to save our data. We used MatBox to visualize the map and shadcn UI libraries for design visualizations.

# Challenges we ran into
- Finding open source that is minimal for our MVP
- Parsing through geo-coordinates in the client-side components
- Difficulty for admin to create a floor plan quickly

# Accomplishments that we're proud of
- Map and save rooms in buildings in real-time
- Store mapped objects in a database
- Deployed the app as a working web app prototype
- It was two out of four of our members' first time in a hackathon!

# What we learned
- Collaborate as a team to decide which framework or solution is appropriate for an MVP
- Learned how to use geo coordinates in dev

# What's next for Roomigator
We’re just getting started. Here’s where Roomigator is headed next:
- Live mapping updates and real-time pathfinding
- Geolocation tracking for dynamic directions
- Hardware integration with LEDs for visual guidance
- Haptic and audio cues to assist visually impaired users
- Text-to-speech navigation for hands-free accessibility
