import AppMain from '../App'
import { Model } from './Model';
import { BaseMaleComponent, BaseFemaleComponent } from './Models';
// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
export default {
  title: '3D',
  component: Model,
  // parameters: {
  //   // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
  //   layout: 'centered',
  // },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    // backgroundColor: { control: 'color' },
  },
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: { Component: AppMain, overrideLevel: 'oilrig' },
};

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const BaseMaleStory = {
  args: {
    Component: BaseMaleComponent,
  },
};
export const BaseFemaleStory = {
  args: {
    Component: BaseFemaleComponent,
  },
};


export const OilrigScene = {
  args: { Component: AppMain, overrideLevel: 'oilrig' },
};
export const CharacterSelectIntroScene = {
  args: { Component: AppMain, overrideLevel: 'character_select' },
};
export const CutScene = {
  parameters: {
    // Disables Chromatic's snapshotting because it's an animation
    chromatic: { disableSnapshot: true },
  },
  args: { Component: AppMain, overrideLevel: 'ocean' },
};