import { ThemeType } from './ThemeContext';

export function getColors(theme: ThemeType) {
  if (theme === 'dark') {
    return {
      background: '#181A20',
      card: '#23262F',
      text: '#F2F2F7',
      subtext: '#8E8E93',
      border: '#23262F',
      accent: '#007AFF',
      error: '#FF3B30',
      button: '#23262F',
      buttonText: '#F2F2F7',
      section: '#23262F',
      input: '#23262F',
      inputText: '#F2F2F7',
      inputBorder: '#333',
      shadow: '#000',
      shadowAccent: '#007AFF',
      disabled: '#444',
      placeholder: '#8E8E93',
    };
  }
  return {
    background: '#F2F2F7',
    card: '#FFFFFF',
    text: '#1C1C1E',
    subtext: '#8E8E93',
    border: '#E5E5EA',
    accent: '#007AFF',
    error: '#FF3B30',
    button: '#007AFF',
    buttonText: '#FFFFFF',
    section: '#FFFFFF',
    input: '#F2F2F7',
    inputText: '#1C1C1E',
    inputBorder: '#E5E5EA',
    shadow: '#000',
    shadowAccent: '#007AFF',
    disabled: '#ccc',
    placeholder: '#8E8E93',
  };
} 