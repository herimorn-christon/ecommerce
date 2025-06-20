import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../redux/hooks";
import { clearPaymentData } from "../../redux/slices/ordersSlice";
import PaymentForm from "./PaymentForm";

interface PaymentProcessorProps {
  amount: number;
  orderId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  addressId?: string | null;
}

const PaymentProcessor: React.FC<PaymentProcessorProps> = ({
  amount,
  orderId,
  onSuccess,
  onCancel,
  addressId,
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  // Clear payment data when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearPaymentData());
    };
  }, [dispatch]);

  // Handle payment completion
  const handlePaymentComplete = () => {
    setPaymentCompleted(true);

    if (onSuccess) {
      onSuccess();
    } else if (orderId) {
      navigate(`/orders/${orderId}`);
    } else {
      navigate("/orders");
    }
  };

  // Handle payment failure or cancellation
  const handlePaymentFailed = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="max-w-md mx-auto">
      {!paymentCompleted && (
        <PaymentForm
          amount={amount}
          onPaymentComplete={handlePaymentComplete}
          onPaymentFailed={handlePaymentFailed}
          addressId={addressId || ""}
          deliveryOption="standard"
        />
      )}
    </div>
  );
};

export default PaymentProcessor;
