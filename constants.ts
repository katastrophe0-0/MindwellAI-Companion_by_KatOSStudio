
import type { QuizQuestion } from './types';

export const MOODS = [
    { level: 1, emoji: '😞', label: 'Awful', color: 'bg-red-400', stroke: '#f87171' },
    { level: 2, emoji: '😕', label: 'Bad', color: 'bg-orange-400', stroke: '#fb923c' },
    { level: 3, emoji: '😐', label: 'Okay', color: 'bg-yellow-400', stroke: '#facc15' },
    { level: 4, emoji: '🙂', label: 'Good', color: 'bg-lime-400', stroke: '#a3e635' },
    { level: 5, emoji: '😄', label: 'Great', color: 'bg-green-400', stroke: '#4ade80' }
];

export const MOOD_TAGS = ['Work', 'Sleep', 'Family', 'Health', 'Social', 'Finance', 'Weather', 'Hobby'];

export const PHQ9_QUESTIONS: QuizQuestion[] = [
  {
    question: 'Little interest or pleasure in doing things',
    options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
    values: [0, 1, 2, 3],
  },
  {
    question: 'Feeling down, depressed, or hopeless',
    options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
    values: [0, 1, 2, 3],
  },
  {
    question: 'Trouble falling or staying asleep, or sleeping too much',
    options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
    values: [0, 1, 2, 3],
  },
  {
    question: 'Feeling tired or having little energy',
    options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
    values: [0, 1, 2, 3],
  },
  {
    question: 'Poor appetite or overeating',
    options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
    values: [0, 1, 2, 3],
  },
  {
    question: 'Feeling bad about yourself — or that you are a failure or have let yourself or your family down',
    options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
    values: [0, 1, 2, 3],
  },
  {
    question: 'Trouble concentrating on things, such as reading the newspaper or watching television',
    options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
    values: [0, 1, 2, 3],
  },
  {
    question: 'Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual',
    options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
    values: [0, 1, 2, 3],
  },
  {
    question: 'Thoughts that you would be better off dead, or of hurting yourself in some way',
    options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
    values: [0, 1, 2, 3],
  },
];

export const GAD7_QUESTIONS: QuizQuestion[] = [
    {
        question: 'Feeling nervous, anxious, or on edge',
        options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
        values: [0, 1, 2, 3],
    },
    {
        question: 'Not being able to stop or control worrying',
        options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
        values: [0, 1, 2, 3],
    },
    {
        question: 'Worrying too much about different things',
        options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
        values: [0, 1, 2, 3],
    },
    {
        question: 'Trouble relaxing',
        options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
        values: [0, 1, 2, 3],
    },
    {
        question: 'Being so restless that it is hard to sit still',
        options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
        values: [0, 1, 2, 3],
    },
    {
        question: 'Becoming easily annoyed or irritable',
        options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
        values: [0, 1, 2, 3],
    },
    {
        question: 'Feeling afraid, as if something awful might happen',
        options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
        values: [0, 1, 2, 3],
    },
];

export const ASRS_QUESTIONS: QuizQuestion[] = [
    {
        question: 'How often do you have trouble wrapping up the final details of a project, once the challenging parts have been done?',
        options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Very Often'],
        values: [0, 1, 2, 3, 4],
    },
    {
        question: 'How often do you have difficulty getting things in order when you have to do a task that requires organization?',
        options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Very Often'],
        values: [0, 1, 2, 3, 4],
    },
    {
        question: 'How often do you have problems remembering appointments or obligations?',
        options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Very Often'],
        values: [0, 1, 2, 3, 4],
    },
    {
        question: 'When you have a task that requires a lot of thought, how often do you avoid or delay getting started?',
        options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Very Often'],
        values: [0, 1, 2, 3, 4],
    },
    {
        question: 'How often do you fidget or squirm with your hands or feet when you have to sit down for a long time?',
        options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Very Often'],
        values: [0, 1, 2, 3, 4],
    },
    {
        question: 'How often do you feel overly active and compelled to do things, like you were driven by a motor?',
        options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Very Often'],
        values: [0, 1, 2, 3, 4],
    },
];

export const ISI_QUESTIONS: QuizQuestion[] = [
    {
        question: 'Difficulty falling asleep',
        options: ['None', 'Mild', 'Moderate', 'Severe', 'Very Severe'],
        values: [0, 1, 2, 3, 4],
    },
    {
        question: 'Difficulty staying asleep',
        options: ['None', 'Mild', 'Moderate', 'Severe', 'Very Severe'],
        values: [0, 1, 2, 3, 4],
    },
    {
        question: 'Problems waking up too early',
        options: ['None', 'Mild', 'Moderate', 'Severe', 'Very Severe'],
        values: [0, 1, 2, 3, 4],
    },
    {
        question: 'How satisfied/dissatisfied are you with your CURRENT sleep pattern?',
        options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'],
        values: [0, 1, 2, 3, 4],
    },
    {
        question: 'How noticeable to others do you think your sleep problem is in terms of impairing the quality of your life?',
        options: ['Not at all', 'A little', 'Somewhat', 'Much', 'Very Much'],
        values: [0, 1, 2, 3, 4],
    },
    {
        question: 'How worried/distressed are you about your current sleep problem?',
        options: ['Not at all', 'A little', 'Somewhat', 'Much', 'Very Much'],
        values: [0, 1, 2, 3, 4],
    },
    {
        question: 'To what extent do you consider your sleep problem to interfere with your daily functioning?',
        options: ['Not at all', 'A little', 'Somewhat', 'Much', 'Very Much'],
        values: [0, 1, 2, 3, 4],
    },
];

export const PTSD_QUESTIONS: QuizQuestion[] = [
    {
        question: 'Had nightmares about the event(s) or thought about the event(s) when you did not want to?',
        options: ['No', 'Yes'],
        values: [0, 1],
    },
    {
        question: 'Tried hard not to think about the event(s) or went out of your way to avoid situations that reminded you of the event(s)?',
        options: ['No', 'Yes'],
        values: [0, 1],
    },
    {
        question: 'Been constantly on guard, watchful, or easily startled?',
        options: ['No', 'Yes'],
        values: [0, 1],
    },
    {
        question: 'Felt numb or detached from people, activities, or your surroundings?',
        options: ['No', 'Yes'],
        values: [0, 1],
    },
    {
        question: 'Felt guilty or unable to stop blaming yourself or others for the event(s) or any problems the event(s) may have caused?',
        options: ['No', 'Yes'],
        values: [0, 1],
    },
];

// Mood Disorder Questionnaire (MDQ) - Adapted for screening
export const MDQ_QUESTIONS: QuizQuestion[] = [
    {
        question: 'Has there ever been a period of time when you felt so good or hyper that other people thought you were not your normal self, or you were so hyper that you got into trouble?',
        options: ['No', 'Yes'],
        values: [0, 1],
    },
    {
        question: 'During that time, were you so irritable that you shouted at people or started fights or arguments?',
        options: ['No', 'Yes'],
        values: [0, 1],
    },
    {
        question: 'During that time, did you feel much more self-confident than usual?',
        options: ['No', 'Yes'],
        values: [0, 1],
    },
    {
        question: 'During that time, did you get much less sleep than usual and found you didn’t really miss it?',
        options: ['No', 'Yes'],
        values: [0, 1],
    },
    {
        question: 'During that time, were you much more talkative or spoke much faster than usual?',
        options: ['No', 'Yes'],
        values: [0, 1],
    },
    {
        question: 'During that time, did thoughts race through your head or could you not slow your mind down?',
        options: ['No', 'Yes'],
        values: [0, 1],
    },
    {
        question: 'During that time, were you so easily distracted by things around you that you had trouble concentrating or staying on track?',
        options: ['No', 'Yes'],
        values: [0, 1],
    },
    {
        question: 'During that time, did you have much more energy than usual?',
        options: ['No', 'Yes'],
        values: [0, 1],
    },
    {
        question: 'During that time, were you much more active or did many more things than usual?',
        options: ['No', 'Yes'],
        values: [0, 1],
    },
    {
        question: 'During that time, were you much more social or outgoing than usual, for example, you telephoned friends in the middle of the night?',
        options: ['No', 'Yes'],
        values: [0, 1],
    },
    {
        question: 'During that time, did you do things that were unusual for you or that other people might have thought were excessive, foolish, or risky?',
        options: ['No', 'Yes'],
        values: [0, 1],
    },
    {
        question: 'During that time, did spending money get you or your family into trouble?',
        options: ['No', 'Yes'],
        values: [0, 1],
    }
];

// McLean Screening Instrument for BPD (MSI-BPD)
export const MSI_BPD_QUESTIONS: QuizQuestion[] = [
    {
        question: 'Have any of your closest relationships been troubled by a lot of arguments or repeated breakups?',
        options: ['No', 'Yes'],
        values: [0, 1],
    },
    {
        question: 'Have you deliberately hurt yourself physically (e.g., punched, cut, burned) or made a suicide attempt?',
        options: ['No', 'Yes'],
        values: [0, 1],
    },
    {
        question: 'Have you had at least two other problems with impulsivity (e.g., eating binges, spending sprees, drinking too much, verbal outbursts)?',
        options: ['No', 'Yes'],
        values: [0, 1],
    },
    {
        question: 'Have you been extremely moody?',
        options: ['No', 'Yes'],
        values: [0, 1],
    },
    {
        question: 'Have you felt very angry often?',
        options: ['No', 'Yes'],
        values: [0, 1],
    },
    {
        question: 'Have you often been distrustful of other people?',
        options: ['No', 'Yes'],
        values: [0, 1],
    },
    {
        question: 'Have you frequently felt unreal or as if things around you were unreal?',
        options: ['No', 'Yes'],
        values: [0, 1],
    },
    {
        question: 'Have you chronically felt empty?',
        options: ['No', 'Yes'],
        values: [0, 1],
    },
    {
        question: 'Have you often felt that you had no idea of who you are or that you have no identity?',
        options: ['No', 'Yes'],
        values: [0, 1],
    },
    {
        question: 'Have you made desperate efforts to avoid feeling abandoned or being abandoned (e.g., called someone many times, pleaded with them)?',
        options: ['No', 'Yes'],
        values: [0, 1],
    },
];

// Obsessive-Compulsive Inventory - Revised (OCI-R)
export const OCI_R_QUESTIONS: QuizQuestion[] = [
    {
        question: 'I have saved up so many things that they get in the way.',
        options: ['Not at all', 'A little', 'Moderately', 'A lot', 'Extremely'],
        values: [0, 1, 2, 3, 4],
    },
    {
        question: 'I check things more often than necessary.',
        options: ['Not at all', 'A little', 'Moderately', 'A lot', 'Extremely'],
        values: [0, 1, 2, 3, 4],
    },
    {
        question: 'I get upset if objects are not arranged properly.',
        options: ['Not at all', 'A little', 'Moderately', 'A lot', 'Extremely'],
        values: [0, 1, 2, 3, 4],
    },
    {
        question: 'I feel compelled to count while I am doing things.',
        options: ['Not at all', 'A little', 'Moderately', 'A lot', 'Extremely'],
        values: [0, 1, 2, 3, 4],
    },
    {
        question: 'I find it difficult to touch an object when I know it has been touched by strangers or certain people.',
        options: ['Not at all', 'A little', 'Moderately', 'A lot', 'Extremely'],
        values: [0, 1, 2, 3, 4],
    },
    {
        question: 'I find it difficult to control my own thoughts.',
        options: ['Not at all', 'A little', 'Moderately', 'A lot', 'Extremely'],
        values: [0, 1, 2, 3, 4],
    },
    {
        question: 'I collect things I don’t need.',
        options: ['Not at all', 'A little', 'Moderately', 'A lot', 'Extremely'],
        values: [0, 1, 2, 3, 4],
    },
    {
        question: 'I repeatedly check doors, windows, drawers, etc.',
        options: ['Not at all', 'A little', 'Moderately', 'A lot', 'Extremely'],
        values: [0, 1, 2, 3, 4],
    },
    {
        question: 'I get upset if others change the way I have arranged things.',
        options: ['Not at all', 'A little', 'Moderately', 'A lot', 'Extremely'],
        values: [0, 1, 2, 3, 4],
    },
    {
        question: 'I feel I have to repeat certain numbers.',
        options: ['Not at all', 'A little', 'Moderately', 'A lot', 'Extremely'],
        values: [0, 1, 2, 3, 4],
    },
    {
        question: 'I sometimes have to wash or clean myself simply because I feel contaminated.',
        options: ['Not at all', 'A little', 'Moderately', 'A lot', 'Extremely'],
        values: [0, 1, 2, 3, 4],
    },
    {
        question: 'I am upset by unpleasant thoughts that come into my mind against my will.',
        options: ['Not at all', 'A little', 'Moderately', 'A lot', 'Extremely'],
        values: [0, 1, 2, 3, 4],
    },
];

export const MEDITATION_SCRIPTS = {
    '5-Minute Mindfulness': `Take a deep breath in... and out. For the next five minutes, we will focus on the present moment. Find a comfortable position, either sitting or lying down. Close your eyes gently. Bring your attention to your breath. Notice the sensation of the air entering your nostrils... filling your lungs... and the gentle release as you exhale. Your mind may wander, and that's okay. When it does, gently guide it back to your breath. Notice any sounds around you without judgment. Just observe them as part of this moment. Feel the contact of your body with the surface beneath you. Feel the gentle rise and fall of your chest. You are safe. You are present. Continue to breathe, moment by moment. As we come to a close, slowly bring your awareness back to the room. Wiggle your fingers and toes. And when you're ready, gently open your eyes. Carry this sense of peace with you.`,
    'Body Scan': `Find a comfortable position lying on your back. Close your eyes and take a few deep breaths. We will now begin a body scan meditation. Bring your awareness to your toes on your left foot. Notice any sensations... warmth, coolness, tingling... without judgment. Now, move your attention to the sole of your foot... your heel... the top of your foot. Slowly, move your awareness up your left leg... to your calf... your shin... your knee... your thigh. Just observe. Now, bring your attention to your right foot, and repeat the process. Your toes... your entire foot... your lower leg... your knee... your thigh. Now, focus on your hips... your abdomen... your lower back. Notice the gentle movement with each breath. Bring your awareness to your chest and heart area. Then to your hands and fingers... up through your arms to your shoulders. Finally, bring your attention to your neck... your jaw... your face... your forehead. Let go of any tension you find. Now, feel your whole body, buzzing with a gentle energy, completely relaxed. Rest in this awareness for a few moments. When you are ready, gently begin to move and open your eyes.`
};