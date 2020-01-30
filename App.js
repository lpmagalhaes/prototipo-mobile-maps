import React from 'react';
import MapView, { Marker, } from 'react-native-maps';
import { Platform, TouchableOpacity, StyleSheet, Text, View, Dimensions, } from 'react-native';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import Constants from 'expo-constants';
import { Icon } from 'react-native-elements';

let id = 0;
function randomColor() {
	return `#${Math.floor(Math.random() * 16777215)
		  .toString(16)
			  .padStart(6, 0)}`;
}

const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0030;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const SPACE = 0.01;

function log(eventName, e) {
	console.log(eventName, e.nativeEvent);
}

const CabecalhoComTitulo = ({titulo}) => {
	const estiloTitulo = {
		fontSize: 24,
		color: 'white',
		fontWeight: '200',
		textAlign: 'center',
	}
	const estiloCabecalho = {
		flex: 1,
		backgroundColor: 'powderblue',
		justifyContent: 'center',
		alignItems: 'center',
	}
	return <View style={estiloCabecalho}>
		<Text style={estiloTitulo} >
			{titulo}
		</Text>
	</View>
}

const RodapeComBotao = ({mudarParaQualTela, mudarTela, texto, tipoSelecionado}) => {
	const estiloBotao = {
		backgroundColor: 'skyblue',
		height: 45,
		borderRadius: 10,
		marginHorizontal: 5,
		justifyContent: 'center',
		flex: 1,
	}
	const estiloBotaoTexto = {
		fontSize: 16,
		color: 'white',
		fontWeight: '200',
		textAlign: 'center',
	}
	const estiloRodape = {
		flex: 1,
		backgroundColor: 'steelblue',
		justifyContent: 'center',
		alignItems: 'center',
		flexDirection: 'row',
	}
	const estiloBotaoVoltar = {
		...estiloBotao,
		backgroundColor: 'gray',
	}

	return <View style={estiloRodape}>
		{
			mudarParaQualTela > 2 &&
			<TouchableOpacity
				onPress={() => mudarTela(mudarParaQualTela - 2)}
				style={estiloBotaoVoltar}>
				<Text style={estiloBotaoTexto} >
					Voltar
				</Text>
			</TouchableOpacity>
		}
		{
			(mudarParaQualTela !== 3 ||
				(tipoSelecionado !== null &&
					mudarParaQualTela === 3)) &&
				<TouchableOpacity
					onPress={() => mudarTela(mudarParaQualTela)}
					style={estiloBotao}>
					<Text style={estiloBotaoTexto} >
						{texto}
					</Text>
				</TouchableOpacity>
		}
	</View>
}

export default class App extends React.Component {

	state = {
		region: {
			latitudeDelta: LATITUDE_DELTA,
			longitudeDelta: LONGITUDE_DELTA,
		},
		markers: [],
		location: null,
		errorMessage: null,
		telaParaMostrar: 1,
		tiposDeEmergencias: [
			{
				icone: 'car',
				texto: 'Acidente de carro',
				selecionado: false,
			},
			{
				icone: 'user',
				texto: 'Pessoa machucada',
				selecionado: false,
			},
			{
				icone: 'heartbeat',
				texto: 'Pressão Alta',
				selecionado: false,
			},
		],
		tipoSelecionado: null,
		numeroDePessoas: 1,
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

	mudarTela = (mudarParaQualTela) => {
		this.setState({telaParaMostrar: mudarParaQualTela})
	}

	render() {
		const {
			telaParaMostrar,
			tiposDeEmergencias,
			tipoSelecionado,
			numeroDePessoas,
		} = this.state
		const estiloLogo = {
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: 'powderblue',
			flex: 5,
		}
		const estiloCorpo = {
			flex: 4,
			backgroundColor: 'skyblue',
		}

		return  (
			<View style={styles.container}>
				{
					telaParaMostrar === 1 &&
					<>
					<View style={estiloLogo}>
						<Icon 
							type='font-awesome'
							name='ambulance'
							color='white'
							size={128}
						/>
					</View>
					<RodapeComBotao 
						mudarTela={this.mudarTela}
						texto={'Fazer Chamada'}
						mudarParaQualTela={2}/>
					</>
				}
				{
					telaParaMostrar === 2 &&
						<>
						<CabecalhoComTitulo
							titulo={'Tipo de Emergência'}/>
						<View style={{
							...estiloCorpo,
							alignItems: 'center',
						}}>
						<Text
							style={{
								color: 'white',
							}}>
							Selecione um tipo
						</Text>
						{
							tiposDeEmergencias.map(item => {
								return <TouchableOpacity 
									key={item.icone}
									onPress={() => this.setState({tipoSelecionado: item.icone})}
									style={{
										flexDirection: 'row',
										marginHorizontal: 10,
										marginVertical: 10,
										backgroundColor: tipoSelecionado === item.icone ? 'green' : 'red',
										height: 65,
										alignItems: 'center',
										justifyContent: 'center',
										borderRadius: 5,
									}}>
									<View style={{flex: 1,}}>
										<Icon
											type='font-awesome'
											name={item.icone}
											color='white'
											size={24}/>
									</View>
									<View style={{flex: 2,}}>
										<Text
											style={{
												color: 'white',
											}}>
											{item.texto}
										</Text>
									</View>
								</TouchableOpacity>
							})
						}
					</View>
						<RodapeComBotao 
							mudarTela={this.mudarTela}
							texto={'Selecionar Tipo'}
							mudarParaQualTela={3}
							tipoSelecionado={tipoSelecionado}/>
						</>
				}
				{
					telaParaMostrar === 3 &&
						<>
						<CabecalhoComTitulo
							titulo={'Pessoas Envolvidas'}/>
						<View style={{...estiloCorpo, justifyContent: 'center'}}>
							<View
								style={{
									flexDirection: 'row',
									alignItems: 'center',
								}}>
								<TouchableOpacity
									onPress={() => this.setState({numeroDePessoas: numeroDePessoas-1 > 0 ? numeroDePessoas - 1 : 1 })}
									style={{
										flex: 1,
										backgroundColor: 'red',
										height: 65,
										borderRadius: 5,
										justifyContent: 'center',
										marginHorizontal: 10 
									}}>
									<Icon
										type='font-awesome'
										name='minus'
										color='white'
										size={24}/>
								</TouchableOpacity>
								<Text
									style={{
										fontSize: 128,
										color: 'white',
									}}>
									{numeroDePessoas}
								</Text>
								<TouchableOpacity
									onPress={() => this.setState({numeroDePessoas: numeroDePessoas+1})}
									style={{
										flex: 1,
										backgroundColor: 'red',
										height: 65,
										borderRadius: 5,
										justifyContent: 'center',
										marginHorizontal: 10 
									}}>
									<Icon
										type='font-awesome'
										name='plus'
										color='white'
										size={24}/>
								</TouchableOpacity>
							</View>
						</View>
						<RodapeComBotao 
							mudarTela={this.mudarTela}
							texto={'Selecionar Pessoas'}
							mudarParaQualTela={4}/>
						</>
				}
				{
					telaParaMostrar === 4 &&
						<>
						<CabecalhoComTitulo
							titulo={'Localização'}/>
						<View style={{
							...estiloCorpo,
							alignItems: 'center',
							justifyContent: 'center',
						}}>
							{
								!this.state.location && 
								<Text
									style={{
										fontSize: 24,
										color: 'white',
										fontWeight: '200',
										textAlign: 'center',
									}}>
									Carregando ...
								</Text>
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
						<RodapeComBotao 
							mudarTela={this.mudarTela}
							texto={'Selecionar Local'}
							mudarParaQualTela={5}/>
						</>
				}
				{
					telaParaMostrar === 5 &&
						<>
						<CabecalhoComTitulo
							titulo={'Resumo'}/>
						<View  style={estiloCorpo}>
							<Text>Tipo de emergencia</Text>
						</View>
						<RodapeComBotao 
							mudarTela={this.mudarTela}
							texto={'Confimar'}
							mudarParaQualTela={6}/>
						</>
				}
				{
					telaParaMostrar === 6 &&
						<>
						<CabecalhoComTitulo
							titulo={'Em Progresso'}/>
						<View  style={estiloCorpo}>
							<Text>Tipo de emergencia</Text>
						</View>
						</>
				}
			</View>
		)
	}

}

const styles = StyleSheet.create({
	container: {
		paddingTop: Constants.statusBarHeight,
		flex: 1,
		paddingHorizontal: 20,
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
