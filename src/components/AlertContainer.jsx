import Alert from './Alert';

const AlertContainer = ({ alerts, onRemoveAlert }) => {
  return (
    <div className="alert-container">
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          type={alert.type}
          message={alert.message}
          duration={alert.duration}
          onClose={() => onRemoveAlert(alert.id)}
        />
      ))}
    </div>
  );
};

export default AlertContainer;
