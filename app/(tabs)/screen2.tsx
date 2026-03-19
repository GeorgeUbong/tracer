import React, { useEffect, useState } from 'react';
import { 
    ActivityIndicator, 
    StyleSheet, 
    Text, 
    View, 
    TouchableOpacity, 
    Linking, 
    Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, UrlTile } from 'react-native-maps';

const ABUJA_FALLBACK = {
    latitude: 9.0765,
    longitude: 7.3986,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
};

type SensorData = {
    latitude: string;
    longitude: string;
    field3: string;
};

export default function HomeScreen3() {
    const [data, setData] = useState<SensorData | null>(null);
    const [loading, setLoading] = useState(true);
    // Modified to handle date and time string
    const [lastUpdate, setLastUpdate] = useState<string>('--/--/-- | --:--:--');
    
    const fetchData = async () => {
        try {
            const reply = await fetch('https://api.thingspeak.com/channels/3299248/fields/1.json?api_key=KH7IWAJ1T6UF2XYK&results=2');
            const result = await reply.json();
            
            console.log("API Feed:", result.feeds[0]);

            if (result.feeds && result.feeds.length > 0) {
                const latest = result.feeds[0];
                setData(latest);
                
                if (result.channel && result.channel.updated_at) {
                    const fullDate = result.channel.updated_at; // "2026-03-19T11:04:33Z"
                    const datePart = fullDate.slice(0, 10);
                    const timePart = fullDate.slice(11, 19);
                    setLastUpdate(`${datePart} | ${timePart}`); 
                    console.log("refresh");
                }
            }
        } catch (error) {
            console.error('Fetch Error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 150000); 
        return () => clearInterval(interval);
    }, []);

    const latNum = parseFloat(data?.latitude || '0');
    const lngNum = parseFloat(data?.longitude || '0');

    const isDataValid = !isNaN(latNum) && !isNaN(lngNum) && latNum !== 0 && lngNum !== 0;

    const currentRegion = isDataValid ? {
        latitude: latNum,
        longitude: lngNum,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    } : ABUJA_FALLBACK;

    const openInExternalMaps = () => {
        const targetLat = isDataValid ? latNum : ABUJA_FALLBACK.latitude;
        const targetLng = isDataValid ? lngNum : ABUJA_FALLBACK.longitude;
        
        const scheme = Platform.OS === 'ios' ? 'maps:0,0?q=' : 'geo:0,0?q=';
        const url = `${scheme}${targetLat},${targetLng}`;
        
        Linking.openURL(url);
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#126900" style={{ flex: 1 }} />;
    }

    return (
        <View style={styles.container}>
            <View style={styles.mapContainer}>
                <MapView 
                    style={styles.map} 
                    region={currentRegion} 
                    showsUserLocation={true}
                >
                    <UrlTile 
                        urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png" 
                        maximumZ={19} 
                        shouldReplaceMapContent={true} 
                    />
                    <Marker coordinate={{ latitude: currentRegion.latitude, longitude: currentRegion.longitude }}>
                        <Ionicons name="location" size={45} color={isDataValid ? "#126900" : "#C0392B"} />
                    </Marker>
                </MapView>
            </View>

            <View style={styles.footer}>
                {/* Updated display to show Date | Time */}
                <Text style={styles.updateText}>Last Sync: {lastUpdate} </Text>
                
                <View style={styles.dataGrid}>
                    <View style={styles.box}>
                        <Ionicons name="compass-outline" size={20} color="#126900" />
                        <Text style={styles.label}>Latitude</Text>
                        <Text style={styles.value}>{data?.latitude || '--'}</Text>
                    </View>

                    <View style={styles.box}>
                        <Ionicons name="navigate-outline" size={20} color="#126900" />
                        <Text style={styles.label}>Longitude</Text>
                        <Text style={styles.value}>{data?.longitude || '--'}</Text>
                    </View>

                    <View style={styles.box}>
                        <Ionicons name="thermometer-outline" size={20} color="#126900" />
                        <Text style={styles.label}>Temp</Text>
                        <Text style={styles.value}>{data?.field3 || '--'}°C</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.button} onPress={openInExternalMaps}>
                    <Ionicons name="map-outline" size={18} color="#fff" style={{ marginRight: 10 }} />
                    <Text style={styles.buttonText}>Open in Maps</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    mapContainer: { flex: 1 },
    map: { flex: 1 },
    footer: {
        paddingHorizontal: 20,
        paddingBottom: 35,
        paddingTop: 20,
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        elevation: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
    },
    updateText: {
        textAlign: 'center',
        fontSize: 11,
        color: '#999',
        marginBottom: 15,
        fontWeight: '600',
    },
    dataGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 25,
    },
    box: {
        backgroundColor: '#fbfcfc',
        paddingVertical: 18,
        borderRadius: 20,
        alignItems: 'center',
        width: '31%',
        borderWidth: 1,
        borderColor: '#f0f2f2'
    },
    label: { fontSize: 9, color: '#aaa', marginBottom: 5 },
    value: { fontSize: 11, fontWeight: 'bold', color: '#2c3e50' },
    button: {
        backgroundColor: '#126900',
        flexDirection: 'row',
        padding: 20,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});