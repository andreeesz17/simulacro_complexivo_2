from rest_framework import serializers

class AirlineSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=120)
    code = serializers.CharField(max_length=10)
    country = serializers.CharField(max_length=120)
    is_active = serializers.BooleanField(default=True)
    created_at = serializers.DateTimeField(required=False)

class FlightEventSerializer(serializers.Serializer):
    flight_id = serializers.IntegerField() # ID de Flight (Postgres)
    
    class EventType:
        CREATED = "CREATED"
        BOARDING_STARTED = "BOARDING_STARTED"
        DEPARTED = "DEPARTED"
        DELAYED = "DELAYED"
        CANCELLED = "CANCELLED"
        
        CHOICES = [
            (CREATED, "Created"),
            (BOARDING_STARTED, "Boarding Started"),
            (DEPARTED, "Departed"),
            (DELAYED, "Delayed"),
            (CANCELLED, "Cancelled"),
        ]
        
    event_type = serializers.ChoiceField(choices=EventType.CHOICES)
    source = serializers.CharField(max_length=50) # WEB | MOBILE | SYSTEM
    note = serializers.CharField(required=False, allow_blank=True)
    created_at = serializers.DateTimeField(required=False)
