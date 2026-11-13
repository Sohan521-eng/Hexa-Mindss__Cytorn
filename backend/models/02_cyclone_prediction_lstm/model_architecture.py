"""
CYCLO-AI: Temporal Attention Bidirectional LSTM for Tropical Cyclone Forecasting
Architecture: 6 Steps x 17 Features -> BiLSTM(128) -> BiLSTM(64) -> TemporalAttention -> [Regression (4), Classification (3)]
"""

try:
    import tensorflow as tf
    from tensorflow.keras import layers, models
except ImportError:
    tf = None
    layers = None
    models = None

if tf is not None:
    class TemporalAttention(layers.Layer):
        def __init__(self, **kwargs):
            super().__init__(**kwargs)

        def build(self, input_shape):
            self.W = self.add_weight(name="att_weight", shape=(input_shape[-1], 1), initializer="normal")
            self.b = self.add_weight(name="att_bias", shape=(input_shape[1], 1), initializer="zeros")
            super().build(input_shape)

        def call(self, x):
            # Alignment score: e_t = tanh(x_t * W + b)
            e = tf.nn.tanh(tf.tensordot(x, self.W, axes=1) + self.b)
            # Softmax attention weights
            alpha = tf.nn.softmax(e, axis=1)
            # Context vector: weighted sum over time steps
            context = tf.reduce_sum(x * alpha, axis=1)
            return context

    def build_cyclone_attention_bilstm(seq_len: int = 6, feature_dim: int = 17) -> models.Model:
        inputs = layers.Input(shape=(seq_len, feature_dim), name="past_18h_cyclone_state")

        # Layer 1: Bidirectional LSTM
        x = layers.Bidirectional(layers.LSTM(128, return_sequences=True))(inputs)
        x = layers.LayerNormalization()(x)
        x = layers.Dropout(0.2)(x)

        # Layer 2: Second Bidirectional LSTM
        x = layers.Bidirectional(layers.LSTM(64, return_sequences=True))(x)
        x = layers.LayerNormalization()(x)
        x = layers.Dropout(0.2)(x)

        # Attention layer pooling the temporal representations
        context_vector = TemporalAttention(name="cyclone_temporal_attention")(x)

        # Shared representation bottleneck
        shared = layers.Dense(128, activation="swish")(context_vector)
        shared = layers.Dropout(0.2)(shared)
        shared = layers.Dense(64, activation="swish")(shared)

        # Output 1: 6-Hour Forward Coordinates & Intensity Regression
        # [NEXT_6H_LAT, NEXT_6H_LON, NEXT_6H_WIND_KTS, NEXT_6H_PRESSURE_HPA]
        regression_output = layers.Dense(4, activation="linear", name="regression_trajectory")(shared)

        # Output 2: 3-Class Intensity Classification (Weak, Moderate, Strong)
        classification_output = layers.Dense(3, activation="softmax", name="intensity_classification")(shared)

        model = models.Model(
            inputs=inputs,
            outputs=[regression_output, classification_output],
            name="CycloAI_BiLSTM_Attention"
        )
        return model
else:
    def build_cyclone_attention_bilstm(*args, **kwargs):
        raise ImportError("TensorFlow is required to build the Bi-LSTM model.")
