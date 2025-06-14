import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';

export type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;
export type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;
export type DiaryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Diary'>;
export type EditorScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Editor'>;

export type HomeScreenRouteProp = RouteProp<RootStackParamList, 'Home'>;
export type DiaryScreenRouteProp = RouteProp<RootStackParamList, 'Diary'>;
export type EditorScreenRouteProp = RouteProp<RootStackParamList, 'Editor'>;