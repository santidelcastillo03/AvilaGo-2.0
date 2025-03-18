import React, { useEffect, useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useLocation, useNavigate } from "react-router-dom";
import { collection, doc, getDoc, addDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../../services/firebaseConfig";
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faCheckCircle, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import '../../assets/styles/payment.css';

const Payment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [activityData, setActivityData] = useState(null);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [participants, setParticipants] = useState(1);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // Add overall loading state

    // Check authentication and get user
    useEffect(() => {
        let isMounted = true; // Use this to prevent setting state on unmounted component
        
        const checkAuth = async () => {
            try {
                // Check if the user is logged in
                const currentUser = auth.currentUser;
                if (!currentUser) {
                    // Redirect to login if not authenticated
                    navigate('/login', {
                        state: {
                            message: 'Por favor inicia sesión para realizar una reserva',
                            redirect: location.pathname
                        }
                    });
                    return;
                }
                
                if (isMounted) {
                    setUser(currentUser);
                }
                
                // Check if we have activity data from location state
                if (location.state && location.state.id) {
                    if (isMounted) {
                        setActivityData(location.state);
                    }
                } else {
                    // If no data in state, try to get it from URL params or redirect
                    console.error('No activity data provided');
                    navigate('/routes');
                    return;
                }
            } catch (err) {
                console.error('Error in auth check:', err);
                if (isMounted) {
                    setError('Error de autenticación. Por favor intenta nuevamente.');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false); // Mark loading as done regardless of outcome
                }
            }
        };
        
        checkAuth();
        return () => { isMounted = false; }; // Cleanup function
    }, [location, navigate]);

    // Calculate total price based on number of participants
    const calculateTotalPrice = () => {
        if (!activityData || !activityData.price) return 10;
        return (activityData.price * participants);
    };

    // Define the createOrder function 
    const createOrderHandler = (data, actions) => {
        const price = calculateTotalPrice();
        
        console.log("Creating PayPal order with amount:", price);
        
        try {
            return actions.order.create({
                purchase_units: [{
                    amount: {
                        currency_code: "USD",
                        value: price.toFixed(2)
                    }
                }]
            });
        } catch (err) {
            console.error("Error creating order:", err);
            setError("Error al crear la orden de pago. Por favor, intenta de nuevo.");
            return null;
        }
    };

    // Handle successful PayPal payment with delayed completion
    // ...existing code...
const onApproveHandler = async (data, actions) => {
    setIsProcessing(true);
    
    try {
        // Capture the PayPal order
        const details = await actions.order.capture();
        console.log("Payment captured:", details);
        
        if (!user) {
            throw new Error("Usuario no autenticado");
        }
        
        // Create a simplified booking document
        const bookingData = {
            userId: user.uid,
            activityId: activityData.id,
            participants: participants,
            bookingDate: serverTimestamp(),
            paymentConfirmed: true,
            paymentMethod: "PayPal",
            paymentAmount: calculateTotalPrice(),
            paymentDetails: {
                transactionId: details.id,
                status: details.status
            }
        };
        
        // Add to bookings collection
        const bookingRef = await addDoc(collection(db, 'bookings'), bookingData);
        console.log("Booking created with ID:", bookingRef.id);
        
        // Extend delay: wait 5 seconds before showing success state to keep PayPal window open longer
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Show success state
        setPaymentSuccess(true);
        setIsProcessing(false);
        
        // Redirect to bookings page after a 10-second delay
        setTimeout(() => {
            navigate('/bookings', { 
                state: { 
                    paymentSuccess: true
                } 
            });
        }, 10000);
        
        return true; // Return successful result to PayPal
        
    } catch (err) {
        console.error("Error in payment process:", err);
        setError(err.message || "Error al procesar la reserva");
        setIsProcessing(false);
        return false; // Return failure to PayPal
    }
};

    const handleCancel = () => {
        navigate(-1);
    };

    // Show loading state
    if (isLoading) {
        return (
            <div className="payment-page">
                <Header />
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Cargando información de la actividad...</p>
                </div>
                <Footer />
            </div>
        );
    }

    // Show error page if no activity data is available
    if (!activityData && !isLoading) {
        return (
            <div className="payment-page">
                <Header />
                <div className="payment-container">
                    <h1>Error</h1>
                    <div className="payment-error">
                        <FontAwesomeIcon icon={faExclamationCircle} />
                        <p>No se pudo cargar la información de la actividad.</p>
                        <button onClick={() => navigate('/routes')} className="retry-button">
                            Volver a las Rutas
                        </button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

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
                        
                        {error && (
                            <div className="payment-error">
                                <FontAwesomeIcon icon={faExclamationCircle} />
                                <p>{error}</p>
                                <button onClick={() => window.location.reload()} className="retry-button">
                                    Intentar nuevamente
                                </button>
                            </div>
                        )}
                        
                        <div className="payment-section">
                            <h3>Selecciona tu método de pago</h3>
                            
                            <div className="paypal-button-wrapper">
                                {isProcessing ? (
                                    <div className="processing-payment">
                                        <div className="loading-spinner"></div>
                                        <p>Procesando pago...</p>
                                    </div>
                                ) : (
                                    <div className="paypal-container">
                                        <PayPalScriptProvider 
                                            options={{
                                                "client-id": "test",
                                                currency: "USD",
                                                intent: "capture",
                                                "commit": true,
                                                "disable-funding": "venmo,credit,card",
                                            }}
                                        >
                                            <PayPalButtons 
                                                createOrder={createOrderHandler}
                                                onApprove={onApproveHandler}
                                                onError={(err) => {
                                                    console.error('PayPal error:', err);
                                                    setError('Error con PayPal. Por favor intenta nuevamente.');
                                                }}
                                                style={{
                                                    layout: 'vertical',
                                                    color: 'gold',
                                                    shape: 'rect',
                                                    label: 'pay'
                                                }}
                                            />
                                        </PayPalScriptProvider>
                                        
                                        {/* Fallback for PayPal issues */}
                                        <div className="mock-payment-section">
                                            <p className="mock-payment-notice">
                                                Si PayPal no carga correctamente, puedes usar nuestra opción de prueba:
                                            </p>
                                            <button 
    className="mock-payment-button"
    onClick={async () => {
        try {
            setIsProcessing(true);
            
            // Wait 2 seconds to simulate processing
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            if (!user) {
                throw new Error("Usuario no autenticado");
            }
            
            // Create reservation document matching the structure expected by the bookings page
            const reservationData = {
                userId: user.uid,
                activityId: activityData.id,
                activityName: activityData.title,
                participants: participants,
                createdAt: serverTimestamp(),
                paymentStatus: 'completed',
                price: calculateTotalPrice()
            };
            
            // Add to reservations collection (not bookings)
            const reservationRef = await addDoc(collection(db, 'reservations'), reservationData);
            console.log("Test reservation created with ID:", reservationRef.id);
            
            // Show success state
            setPaymentSuccess(true);
            
            // No redirect to stay on current page
            setTimeout(() => {
                navigate('/bookings', { 
                    state: { paymentSuccess: true } 
                });
            }, 5000);
        } catch (err) {
            console.error("Error creating test booking:", err);
            setError(err.message || "Error al procesar la reserva de prueba");
        } finally {
            setIsProcessing(false);
        }
    }}
>
    Realizar Pago de Prueba
</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div className="payment-info">
                                <p>Al proceder con el pago, aceptas los términos y condiciones de la actividad.</p>
                                <p>Las cancelaciones deben realizarse con al menos 24 horas de anticipación.</p>
                            </div>
                        </div>
                    </>
                )}
            </div>
            
            <Footer />
        </div>
    );
};

export default Payment;