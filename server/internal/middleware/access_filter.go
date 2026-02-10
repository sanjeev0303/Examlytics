package middleware

import (
	"net/http"

	"github.com/examlytics/server/internal/dto"
	"github.com/examlytics/server/pkg/logger"
	"github.com/gin-gonic/gin"
)

// AccessFilter blocks requests from certain IPs and countries
type AccessFilter struct {
	blockedCountries []string
	blockedIPs       []string
}

// NewAccessFilter creates a new AccessFilter middleware
func NewAccessFilter() *AccessFilter {
	return &AccessFilter{
		blockedCountries: []string{"CN", "RU", "KP"},
		blockedIPs:       []string{},
	}
}

// Filter is the middleware handler that filters access
func (m *AccessFilter) Filter() gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()

		for _, blockedIP := range m.blockedIPs {
			if ip == blockedIP {
				logger.Warnf("Access denied for blocked IP: %s", ip)
				c.AbortWithStatusJSON(http.StatusForbidden, dto.ErrorResponse{Error: "Access denied."})
				return
			}
		}

		c.Next()
	}
}

// AddBlockedIP adds an IP to the blocked list
func (m *AccessFilter) AddBlockedIP(ip string) {
	m.blockedIPs = append(m.blockedIPs, ip)
}

// AddBlockedCountry adds a country code to the blocked list
func (m *AccessFilter) AddBlockedCountry(countryCode string) {
	m.blockedCountries = append(m.blockedCountries, countryCode)
}
