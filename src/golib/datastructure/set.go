package datastructure

type Set interface {
	Add(val string)
	AddSlice(vals []string)
	Has(val string) bool
}

func (s *setImpl) AddSlice(vals []string) {
	for _, val := range vals {
		s.Add(val)
	}
}

type setImpl struct {
	values map[string]bool
}

func (s *setImpl) Add(val string) {
	s.values[val] = true
}

func (s *setImpl) Has(val string) bool {
	_, found := s.values[val]
	return found
}

func NewSet() Set {
	return &setImpl{
		values: make(map[string]bool),
	}
}
