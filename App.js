import React from 'react';
import MapView, { Marker, } from 'react-native-maps';
import { Platform, TouchableOpacity, StyleSheet, Text, View, Dimensions, } from 'react-native';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import Constants from 'expo-constants';

let id = 0;
function randomColor() {
	return `#${Math.floor(Math.random() * 16777215)
		  .toString(16)
			  .padStart(6, 0)}`;
}

const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE = -15.8306078
const LONGITUDE = -48.0469026 
const LATITUDE_DELTA = 0.0030;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const SPACE = 0.01;

function log(eventName, e) {
	console.log(eventName, e.nativeEvent);
}

export default class App extends React.Component {

	state = {
		region: {
			latitude: LATITUDE,
			longitude: LONGITUDE,
			latitudeDelta: LATITUDE_DELTA,
			longitudeDelta: LONGITUDE_DELTA,
		},
		markers: [],
		location: null,
		errorMessage: null,
	}

	componentDidMount() {
		if (Platform.OS === 'android' && !Constants.isDevice) {
			this.setState({
				errorMessage: 'Oops, this will not work on Sketch in an Android emulator. Try it on your device!',
			});
		} else {
			this._getLocationAsync();
		}
	}

	_getLocationAsync = async () => {
		const { status } = await Permissions.askAsync(Permissions.LOCATION);
		if (status !== 'granted') {
			this.setState({
				errorMessage: 'Permission to access location was denied',
			});
		}

		const location = await Location.getCurrentPositionAsync({});
		const marca = {
			key: 'marcadorOndeEstou',
			coordinate: {
				latitude: location.coords.latitude,
				longitude: location.coords.longitude,
			},
			position: {
				x: 336,
				y: 711,
			},
		}
		console.log('marcador onde estou', marca)
		this.setState(estadoAtual => {
			return {
				location,
				markers: [...estadoAtual.markers, marca],
				region: {
					...estadoAtual.region,
					latitude: marca.coordinate.latitude,
					longitude: marca.coordinate.longitude,
				}
			}
		})
	};

	onMapPress(e) {
		this.setState({
			markers: [
				...this.state.markers,
				{
					coordinate: e.nativeEvent.coordinate,
					key: id++,
					color: randomColor(),
				},
			],
		});
	}

	render() {
		let text = 'Waiting..';
		if (this.state.errorMessage) {
			text = this.state.errorMessage;
		} else if (this.state.location) {
			text = JSON.stringify(this.state.location);
		}
		console.log(text)
		return  (
			<View style={styles.container}>
				{
					this.state.location === null &&
					<Text style={{flex: 1, color: '#000000'}}>Carregando ...</Text>
				}
				{
					this.state.location &&
						<MapView
							provider={this.props.provider}
							style={styles.map}
							initialRegion={this.state.region}
							onRegionChange={e => console.log(e)}
						>
							{this.state.markers.map(marker => (
								<Marker
									key={marker.key}
									coordinate={marker.coordinate}
									pinColor={marker.color}
									onSelect={e => log('onSelect', e)}
									onDrag={e => log('onDrag', e)}
									onDragStart={e => log('onDragStart', e)}
									onDragEnd={e => log('onDragEnd', e)}
									onPress={e => log('onPress', e)}
									draggable
								/>
							))}
						</MapView>
				}
			</View>
		)
	}

}

const styles = StyleSheet.create({
	container: {
		...StyleSheet.absoluteFillObject,
		justifyContent: 'flex-end',
		alignItems: 'center',
		paddingTop: Constants.statusBarHeight,
	},
	map: {
		...StyleSheet.absoluteFillObject,
	},
	bubble: {
		backgroundColor: 'rgba(255,255,255,0.7)',
		paddingHorizontal: 18,
		paddingVertical: 12,
		borderRadius: 20,
	},
	latlng: {
		width: 200,
		alignItems: 'stretch',
	},
	button: {
		width: 80,
		paddingHorizontal: 12,
		alignItems: 'center',
		marginHorizontal: 10,
	},
	buttonContainer: {
		flexDirection: 'row',
		marginVertical: 20,
		backgroundColor: 'transparent',
	},
});
