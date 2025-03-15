import React, { useState } from 'react';
import '../../assets/styles/payment.css';
import paypalLogo from '../../assets/images/paypallogo.png'; 
import unimetLogo from '../../assets/images/logo.png'; 

const Payment = ({ cartItems = [], totalPrice = "$$$" }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handlePayment = () => {
    console.log('Processing payment...');
    // Add payment processing logic here
  };

  // Default cart item if none provided
  const defaultCartItem = {
    title: "Yoga En Las Alturas",
    date: "Domingo 27/02/25",
    time: "3:30pm - 5:00pm",
    image: "https://via.placeholder.com/150" // Using a placeholder image for now
  };

  // Use provided cart items or default
  const itemsToDisplay = cartItems.length > 0 ? cartItems : [defaultCartItem];

  return (
    <div className="reservation-container">
      <div className="close-button">×</div>
      
      <div className="logo-container">
        <img src={unimetLogo} alt="UNIMET AvilaGo Logo" className="unimet-logo" />
      </div>
      
      <div className="reservation-content">
        <div className="left-panel">
          <div className="reservation-header">
            <h1>Confirmacion de Reserva</h1>
          </div>
          
          <div className="features-list">
            <div className="feature-item">
              <div className="checkmark">✓</div>
              <p>Rutas seguras con personal preparado</p>
            </div>
            <div className="feature-item">
              <div className="checkmark">✓</div>
              <p>Se parte de la comunidad</p>
            </div>
            <div className="feature-item">
              <div className="checkmark">✓</div>
              <p>Disfruta el viaje con amigos</p>
            </div>
            <div className="feature-item">
              <div className="checkmark">✓</div>
              <p>Conoce tu ciudad</p>
            </div>
          </div>
          
          <div className="cart-items">
            {itemsToDisplay.map((item, index) => (
              <div className="cart-item" key={index}>
                <div className="item-image">
                  <img src={item.image} alt={item.title} />
                </div>
                <div className="item-details">
                  <h3>{item.title}</h3>
                  <p>{item.date}</p>
                  <p>{item.time}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="total-price">
            <p>A PAGAR:</p>
            <p className="price">{totalPrice}</p>
          </div>
        </div>
        
        <div className="right-panel">
          <div className="payment-section">
            <div className="payment-header">
              <div className="payment-icon">💳</div>
              <h2>Paga seguro con:</h2>
            </div>
            
            <div className="payment-method">
              <p>Paypal</p>
              <div className="paypal-button">
                <img src={paypalLogo} alt="PayPal" />
              </div>
            </div>
            
            <div className="login-form">
              <div className="form-group">
                <label>Email o usuario</label>
                <input 
                  type="text" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </div>
              
              <div className="form-group">
                <label>Contrasena</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                />
              </div>
              
              <button className="login-button">
                Ingresar
              </button>
            </div>
            
            <button className="payment-button" onClick={handlePayment}>
              Pagar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;