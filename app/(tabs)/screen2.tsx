import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Linking,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
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
    field1:string;
    field2: string;
    field4: string;
};

export default function HomeScreen3() {
    const [data, setData] = useState<SensorData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
 //   const [lastUpdate, setLastUpdate] = useState<string>('--/--/-- | --:--:--');
    const isMountedRef = useRef(true);

    const fetchData = async (isInitialLoad = false) => {
        if (isInitialLoad) setLoading(true);
        setError(null);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        console.log('refresh2')

        try {
           
            const reply = await fetch('https://api.thingspeak.com/channels/3299248/feeds.json?results=2', {
                signal: controller.signal,
            });

            if (!reply.ok) throw new Error(`API Error: ${reply.status}`);

            const result = await reply.json();

            if (result.feeds && result.feeds.length > 0) {
                const latest = result.feeds.at(-1);
                if (isMountedRef.current) {
                    setData(latest);

                /*    if (result.channel?.updated_at) {
                        const fullDate = result.channel.updated_at;
                        setLastUpdate(`${fullDate.slice(0, 10)} | ${fullDate.slice(11, 19)}`);
                    } */
                }
            }
        } catch (err) {
            console.error('Fetch Error:', err);
            if (!data && isMountedRef.current) {
                setError('Unable to load data. Please check your connection.');
            }
        } finally {
            clearTimeout(timeoutId);
            if (isMountedRef.current) setLoading(false);
        }
    };

    useEffect(() => {
        isMountedRef.current = true;
        fetchData(true);

        const interval = setInterval(() => fetchData(false), 15000);
        
        return () => {
            isMountedRef.current = false;
            clearInterval(interval); // Clean up the timer!
        };
    }, []);

    // --- Logic for Coordinates (Moved outside useEffect) ---
    const latNum = parseFloat(data?.field1 || '0');
    const lngNum = parseFloat(data?.field2 || '0');
    const isDataValid = !isNaN(latNum) && !isNaN(lngNum) && latNum !== 0;

    const currentRegion = isDataValid ? {
        latitude: latNum,
        longitude: lngNum,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    } : ABUJA_FALLBACK;

    // --- Conditional Rendering (Properly placed in the component body) ---

    if (loading && !data) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#126900" />
                <Text style={{ marginTop: 10, color: '#666' }}>Connecting to Sensor...</Text>
            </View>
        );
    }

    if (error && !data) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={60} color="#C0392B" />
                <Text style={styles.errorTitle}>Connection Failed</Text>
                <TouchableOpacity style={styles.retryButton} onPress={() => fetchData(true)}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
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
                        urlTemplate="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
                        maximumZ={19}
                        shouldReplaceMapContent={true}
                        // @ts-ignore
                        userAgent="TrackerApp/1.0"
                    />
                    <Marker coordinate={{ latitude: currentRegion.latitude, longitude: currentRegion.longitude }}>
                        <Ionicons name="location" size={45} color={isDataValid ? "#126900" : "#C0392B"} />
                    </Marker>
                </MapView>
            </View>

            <View style={styles.footer}>
                <Text style={styles.updateText}>{/**Last Sync: {lastUpdate}  */}
                    Time updated: {(data?.field4 || '0')}</Text>

                <View style={styles.dataGrid}>
                    <View style={styles.box}> 
                        <Ionicons name="compass-outline" size={20} color="#126900" />
                        <Text style={styles.label}>Latitude</Text>
                        <Text style={styles.value}>{data?.field1 || '--'}</Text>
                    </View>

                    <View style={styles.box}>
                        <Ionicons name="navigate-outline" size={20} color="#126900" />
                        <Text style={styles.label}>Longitude</Text>
                        <Text style={styles.value}>{data?.field2 || '--'}</Text>
                    </View>

                    <View style={styles.box}>
                        <Ionicons name="thermometer-outline" size={20} color="#126900" />
                        <Text style={styles.label}>Temp</Text>
                        <Text style={styles.value}>{data?.field3 || '--'}°C</Text>
                    </View>
                </View>

                <TouchableOpacity 
                    style={styles.button} 
                    onPress={() => Linking.openURL(Platform.OS === 'ios' ? `maps:0,0?q=${latNum},${lngNum}` : `geo:0,0?q=${latNum},${lngNum}`)}
                >
                    <Ionicons name="map-outline" size={18} color="#fff" style={{ marginRight: 10 }} />
                    <Text style={styles.buttonText}>Open in Maps</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

// --- Styles (Moved outside the component for performance) ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
    updateText: { textAlign: 'center', fontSize: 11, color: '#999', marginBottom: 15, fontWeight: '600' },
    dataGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
    box: { backgroundColor: '#fbfcfc', paddingVertical: 18, borderRadius: 20, alignItems: 'center', width: '31%', borderWidth: 1, borderColor: '#f0f2f2' },
    label: { fontSize: 9, color: '#aaa', marginBottom: 5 },
    value: { fontSize: 11, fontWeight: 'bold', color: '#2c3e50' },
    button: { backgroundColor: '#126900', flexDirection: 'row', padding: 20, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 25 },
    errorTitle: { marginTop: 20, fontSize: 22, fontWeight: 'bold', color: '#333' },
    retryButton: { backgroundColor: '#126900', marginTop: 20, paddingHorizontal: 30, paddingVertical: 14, borderRadius: 25 },
    retryButtonText: { color: '#fff', fontWeight: '700' },
});