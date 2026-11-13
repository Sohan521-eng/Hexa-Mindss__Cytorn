"""
CYCLO-AI: EfficientNet-B0 Dual-Head Cyclone Identification & Wind Speed Model
Architecture: 4-Channel Input (IR, WV, VIS, PMW) -> EfficientNet-B0 -> (Classification + Wind Speed Regression)
"""

try:
    import torch
    import torch.nn as nn
    from torchvision import models
except ImportError:
    torch = None
    nn = None
    models = None

if torch is not None:
    class EfficientNetCycloneB0(nn.Module):
        def __init__(self, num_classes: int = 4, in_channels: int = 4, pretrained: bool = False):
            super().__init__()
            # Base backbone
            weights = models.EfficientNet_B0_Weights.DEFAULT if pretrained else None
            self.backbone = models.efficientnet_b0(weights=weights)

            # Adapt first convolutional layer to accept 4 channels
            orig_conv = self.backbone.features[0][0]
            self.backbone.features[0][0] = nn.Conv2d(
                in_channels=in_channels,
                out_channels=orig_conv.out_channels,
                kernel_size=orig_conv.kernel_size,
                stride=orig_conv.stride,
                padding=orig_conv.padding,
                bias=False
            )

            # Feature dimension from EfficientNet-B0 is 1280
            feature_dim = self.backbone.classifier[1].in_features
            self.backbone.classifier = nn.Identity()

            # Shared bottleneck representation
            self.bottleneck = nn.Sequential(
                nn.Linear(feature_dim, 256),
                nn.BatchNorm1d(256),
                nn.SiLU(),
                nn.Dropout(0.3)
            )

            # Head 1: 4-Class Cyclone Intensity Classifier (Weak, Moderate, Strong, Very Strong)
            self.classifier_head = nn.Sequential(
                nn.Linear(256, 64),
                nn.SiLU(),
                nn.Dropout(0.2),
                nn.Linear(64, num_classes)
            )

            # Head 2: Wind Speed Continuous Regression (in knots)
            self.regression_head = nn.Sequential(
                nn.Linear(256, 64),
                nn.SiLU(),
                nn.Linear(64, 1)
            )

        def forward(self, x):
            feats = self.backbone(x)
            bottleneck_feats = self.bottleneck(feats)
            logits = self.classifier_head(bottleneck_feats)
            wind_speed = self.regression_head(bottleneck_feats)
            return logits, wind_speed.squeeze(-1)

        def extract_features(self, x):
            """Returns spatial activation maps before global pooling (used for Grad-CAM)."""
            return self.backbone.features(x)
else:
    class EfficientNetCycloneB0:
        def __init__(self, *args, **kwargs):
            raise ImportError("PyTorch is required to initialize EfficientNetCycloneB0.")
