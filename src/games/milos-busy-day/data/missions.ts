export interface MissionStep {
  id:       string;
  label:    string;
  emoji:    string;
  room:     string;
  objects:  string[]; // object IDs needed
  speech:   string;
}

export interface Mission {
  id:          string;
  title:       string;
  emoji:       string;
  description: string;
  steps:       MissionStep[];
  color:       string;
}

export const MISSIONS: Mission[] = [
  {
    id: 'school-morning', title: 'School Morning!', emoji: '🏫', color: '#FF9F43',
    description: 'Help Milo get ready for school!',
    steps: [
      { id: 'wake-up',    label: 'Wake Up',      emoji: '⏰', room: 'bedroom',   objects: ['alarm','curtains'],              speech: 'Time to wake up! Stop the alarm and open the curtains!' },
      { id: 'get-dressed',label: 'Get Dressed',  emoji: '👕', room: 'bedroom',   objects: ['closet','pyjamas'],             speech: 'Choose an outfit from the closet!' },
      { id: 'brush-teeth',label: 'Brush Teeth',  emoji: '🦷', room: 'bathroom',  objects: ['toothpaste','brush-top','brush-bot','rinse'], speech: 'Let\'s brush those teeth until they sparkle!' },
      { id: 'breakfast',  label: 'Eat Breakfast',emoji: '🥣', room: 'kitchen',   objects: ['cereal','milk','fruit','eat-bowl','plate'], speech: 'Time for a healthy breakfast!' },
      { id: 'pack-bag',   label: 'Pack School Bag',emoji:'🎒', room: 'schoolbag', objects: ['book-bag','pencil','lunchbox','waterbottle'], speech: 'Pack everything for school!' },
    ],
  },
  {
    id: 'clean-up',  title: 'Big Clean Up!', emoji: '🧹', color: '#6BCB77',
    description: 'Help Milo tidy the whole house!',
    steps: [
      { id: 'clean-bedroom', label: 'Tidy Bedroom',  emoji: '🛏️', room: 'bedroom',  objects: ['bed','laundry'],             speech: 'Make the bed and put clothes away!' },
      { id: 'clean-bathroom',label: 'Tidy Bathroom', emoji: '🛁', room: 'bathroom', objects: ['towel','handsoap'],          speech: 'Hang the towel and tidy the bathroom!' },
      { id: 'clean-kitchen', label: 'Clean Kitchen', emoji: '🍳', room: 'kitchen',  objects: ['plate','spill'],             speech: 'Clean the kitchen after breakfast!' },
      { id: 'clean-playroom',label: 'Tidy Playroom', emoji: '🎮', room: 'playroom', objects: ['toy-box','bookshelf','crayons','blocks'], speech: 'Put everything away in the playroom!' },
    ],
  },
];

export const getDailyMission = (): Mission => {
  const index = new Date().getDate() % MISSIONS.length;
  return MISSIONS[index];
};
