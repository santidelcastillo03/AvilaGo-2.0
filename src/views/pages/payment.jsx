import React, { useEffect, useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useLocation, useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { getFirestore, addDoc, collection, serverTimestamp } from "firebase/firestore";
import Header from '../components/Header.jsx';
import '../../assets/styles/payment.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

const Payment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [activityData, setActivityData] = useState(null);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [user, setUser] = useState(null);
    const [paypalLoaded, setPaypalLoaded] = useState(false);

    // Check user authentication
    useEffect(() => {
        const auth = getAuth();
        if (auth.currentUser) {
            setUser(auth.currentUser);
        } else {
            // Redirect to login if not logged in
            navigate('/login', { 
                state: { 
                    from: location.pathname,
                    message: 'Inicia sesión para completar la reserva'
                } 
            });
        }
    }, [navigate, location.pathname]);

    // Get activity data from location state
    useEffect(() => {
        if (location.state) {
            setActivityData(location.state);
        } else {
            // Redirect if no activity data
            navigate('/routes');
        }
    }, [location.state, navigate]);

    // PayPal configuration - Use sandbox client ID
    const initialOptions = {
        "client-id": "test", // Use PayPal sandbox client ID
        currency: "USD",
        intent: "capture",
    }

    // Create PayPal order
    const createOrder = (data, actions) => {
        console.log("Creating PayPal order");
        const price = activityData?.price || 10;
        return actions.order.create({
            purchase_units: [
                {
                    description: `Reserva para ${activityData?.title || 'Actividad'}`,
                    amount: {
                        currency_code: "USD",
                        value: price.toString(),
                    },
                },
            ],
        });
    }

    // Handle payment approval
    const onApprove = (data, actions) => {
        console.log("Payment approved", data);
        setIsProcessing(true);
        
        // For sandbox testing, we can just simulate success
        setTimeout(() => {
            const saveReservation = async () => {
                try {
                    const auth = getAuth();
                    const db = getFirestore();
                    
                    // Add reservation to Firestore
                    await addDoc(collection(db, 'reservations'), {
                        activityId: activityData.id || 'sample-id',
                        userId: auth.currentUser.uid,
                        userEmail: auth.currentUser.email,
                        activityName: activityData?.title || 'Activity',
                        price: activityData?.price || 10,
                        paymentId: data.orderID || 'sandbox-payment',
                        paymentStatus: 'completed',
                        createdAt: serverTimestamp(),
                        status: 'confirmed'
                    });
                    
                    setPaymentSuccess(true);
                    
                    // Redirect after a delay
                    setTimeout(() => {
                        navigate('/reservations', { state: { paymentSuccess: true } });
                    }, 3000);
                    
                } catch (error) {
                    console.error("Error saving reservation: ", error);
                    alert("Hubo un problema al guardar tu reserva. Por favor contacta a soporte.");
                } finally {
                    setIsProcessing(false);
                }
            };
            
            saveReservation();
        }, 2000);
        
        return Promise.resolve(); // Simulate successful capture
    }

    // Handle cancel button
    const handleCancel = () => {
        navigate(-1);
    }
    
    // Debug
    useEffect(() => {
        console.log("PayPal component rendered");
    }, []);

    return (
        <div className="payment-page">
            <Header />
            
            <div className="payment-container">
                {paymentSuccess ? (
                    <div className="payment-success-container">
                        <div className="success-icon">
                            <FontAwesomeIcon icon={faCheckCircle} />
                        </div>
                        <h2>¡Pago Exitoso!</h2>
                        <p>Tu reserva ha sido confirmada.</p>
                        <p className="redirect-message">Serás redirigido a tus reservaciones en unos segundos...</p>
                    </div>
                ) : (
                    <>
                        <h1>Reservar Actividad</h1>
                        
                        <button className="back-button" onClick={handleCancel}>
                            <FontAwesomeIcon icon={faChevronLeft} />
                            <span>Volver</span>
                        </button>
                        
                        {activityData && (
                            <div className="reservation-summary">
                                <div className="activity-image-container">
                                    <img 
                                        src={activityData.imageSrc} 
                                        alt={activityData.title} 
                                        className="activity-thumbnail" 
                                    />
                                </div>
                                
                                <div className="reservation-details">
                                    <h2>{activityData.title}</h2>
                                    
                                    <ul className="details-list">
                                        <li>
                                            <span className="detail-label">Guía:</span>
                                            <span className="detail-value">{activityData.guideName}</span>
                                        </li>
                                        <li>
                                            <span className="detail-label">Duración:</span>
                                            <span className="detail-value">{activityData.duration}</span>
                                        </li>
                                        <li>
                                            <span className="detail-label">Capacidad:</span>
                                            <span className="detail-value">{activityData.capacity} personas</span>
                                        </li>
                                        <li className="price-detail">
                                            <span className="detail-label">Precio Total:</span>
                                            <span className="price-value">
                                                ${activityData.price ? activityData.price.toFixed(2) : '10.00'} USD
                                            </span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        )}
                        
                        <div className="payment-section">
                            <h3>Selecciona tu método de pago</h3>
                            
                            <div className="paypal-container">
                                {isProcessing ? (
                                    <div className="processing-payment">
                                        <div className="loading-spinner"></div>
                                        <p>Procesando pago...</p>
                                    </div>
                                ) : (
                                    <PayPalScriptProvider options={{
                                        "client-id": "sb", // Use 'sb' for sandbox testing
                                        currency: "USD",
                                        components: "buttons"
                                    }}>
                                        <PayPalButtons 
                                            forceReRender={[activityData?.price || 10]}
                                            createOrder={createOrder} 
                                            onApprove={onApprove}
                                            style={{
                                                layout: 'vertical',
                                                color: 'gold',
                                                shape: 'rect',
                                                label: 'pay',
                                                height: 40
                                            }}
                                        />
                                    </PayPalScriptProvider>
                                )}
                                
                                {/* Fallback button for development/testing */}
                                <div className="test-payment-buttons">
                                    <button 
                                        className="simulate-payment-button" 
                                        onClick={() => onApprove({orderID: 'test-order-123'}, {})}
                                    >
                                        Simular Pago (Solo para desarrollo)
                                    </button>
                                </div>
                            </div>
                            
                            <div className="payment-info">
                                <p>Al proceder con el pago, aceptas los términos y condiciones de la actividad.</p>
                                <p>Las cancelaciones deben realizarse con al menos 24 horas de anticipación.</p>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default Payment;