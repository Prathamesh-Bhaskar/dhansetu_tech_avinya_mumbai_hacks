/**
 * @format
 */

import { AppRegistry } from 'react-native';
import AppWrapper from './AppWrapper'; // App with Auth/Family contexts
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => AppWrapper);
