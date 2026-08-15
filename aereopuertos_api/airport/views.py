from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Gate, Flight
from .serializers import GateSerializer, FlightSerializer
from .permissions import IsAdminOrReadOnly
from django.conf import settings
from pymongo import MongoClient
import datetime

class GateViewSet(viewsets.ModelViewSet):
    queryset = Gate.objects.all().order_by("id")
    serializer_class = GateSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ["code", "terminal"]
    ordering_fields = ["id", "code", "terminal"]

class FlightViewSet(viewsets.ModelViewSet):
    queryset = Flight.objects.select_related("gate").all().order_by("-id")
    serializer_class = FlightSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["gate", "status"]
    search_fields = ["flight_number", "destination", "gate__code"]
    ordering_fields = ["id", "departure_time", "flight_number", "created_at"]

    def get_permissions(self):
        # Público: SOLO listar vuelos y puertas
        if self.action == "list":
            return [AllowAny()]
        return super().get_permissions()

    def perform_create(self, serializer):
        # Primero guardamos el vuelo en PostgreSQL
        flight = serializer.save()

        # Generamos el evento en MongoDB
        try:
            client = MongoClient(settings.MONGO_URI)
            db = client[settings.MONGO_DB]
            collection = db['flight_events']

            event = {
                "flight_id": flight.id,
                "event_type": "CREATED",
                "source": "WEB", # o SYSTEM/API, según se requiera
                "note": f"Flight {flight.flight_number} created",
                "created_at": datetime.datetime.now(datetime.timezone.utc)
            }
            collection.insert_one(event)
        except Exception as e:
            # Podríamos loguear el error aquí
            print(f"Error al registrar en MongoDB: {e}")
